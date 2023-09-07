import { debounceTime, tap, map, filter, mergeMap } from "https://esm.sh/rxjs";
import {
    Transformer,
    TransformerInput,
    TransformerOutput,
} from "../transformer.js";

import { deepEqual } from "https://esm.sh/fast-equals";
window.totalSet = new Set();
export class CompositeTransformer extends Transformer {
    constructor(ide, canvasId, props = {}, id) {
        super(ide, canvasId, props, id);

        this.nodes = new Set();
        this.connections = new Set();
    }

    get schemaInputs() {
        return (async () => {
            let inputs = this.findUnconnectedPorts("input", true);
            while (!inputs.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                inputs = this.findUnconnectedPorts("input", true);
            }
        })();
    }

    get schemaOutputs() {
        return (async () => {
            let outputs = this.findUnconnectedPorts("output", true);
            while (!outputs.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                outputs = this.findUnconnectedPorts("output", true);
            }
        })();
    }
    async init() {
        while (!this.nodes) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.snapshots = this.ide.snapshots(this.props.canvasId).write;
        this.snapshots
            .pipe(
                filter((snapshot) => snapshot),
                debounceTime(100),
                tap((snapshots) =>
                    console.log("Composite snapshot", snapshots)
                ),
                mergeMap(this.consumeSnapshot.bind(this)),
                map(this.updateIO.bind(this))
            )
            .subscribe(() => {
                console.log("Composite snapshot consumed");
                this.readyResolve();
                totalSet.add(this);
                this.editorNode?.requestUpdate();
                this.requestSnapshot();
            });

        this.transform();
    }

    serialize() {
        const start = super.serialize();

        // get the frozen values from all inner node inputs
        const frozenInputs = Array.from(this.nodes.values())
            .map((node) => node.inputs)
            .map((inputs) =>
                Object.entries(inputs)
                    .filter(([_, input]) => input.subject.getValue()?.frozen)
                    .map(([key, input]) => [key, input])
            )
            .flat();

        // insert by key into the start object
        for (const [key, input] of frozenInputs) {
            start.inputs[key] = input.subject.getValue();
        }

        return start;
    }

    modifyConnections(connections) {
        for (const connection of connections) {
            connection.source = `${this.id}-${connection.source}`;
            connection.target = `${this.id}-${connection.target}`;
            connection.sourceOutput = `${this.id}-${connection.sourceOutput}`;
            connection.targetInput = `${this.id}-${connection.targetInput}`;
        }
    }

    async consumeSnapshot(snapshot) {
        snapshot = JSON.parse(JSON.stringify(snapshot));
        const currentNodes = Array.from(this.nodes.values());
        const currentConnections = Array.from(this.connections.values());

        const idMap = new Map();
        // adjust ids
        for (const node of snapshot.nodes) {
            idMap.set(node.id, node.id);
            node.id = `${this.id}-${node.id}`;
        }

        this.modifyConnections(snapshot.connections);

        for (const connection of currentConnections) {
            if (!snapshot.connections.find((c) => c.id === connection.id)) {
                this.connections.delete(connection);
                this.unsubscribeConnection(connection);
            }
        }

        // Remove nodes and connections not in snapshot
        for (const node of currentNodes) {
            const snapshotNode = snapshot.nodes.find((n) => n.id === node.id);
            if (!snapshotNode) {
                this.removeNode(node);
            } else {
                // Update node inputs if they don't match snapshot
                Object.keys(node.inputs).forEach((key) => {
                    const [_, ...rest] = key.split("-");
                    const snapKey = rest.join("-");
                    console.log(key, snapKey, node.inputs, snapshotNode.inputs);
                    if (
                        !deepEqual(
                            node.inputs[key].subject.getValue(),
                            snapshotNode.inputs[snapKey]
                        ) &&
                        snapshotNode.inputs[snapKey]?.frozen
                    ) {
                        node.inputs[key].subject.next(
                            snapshotNode.inputs[snapKey]
                        );
                    }
                });
            }
        }

        // Add nodes and connections from snapshot
        for (const node of snapshot.nodes) {
            if (!currentNodes.find((n) => n.id === node.id)) {
                const innerNode = Transformer.deserialize(this.ide, node);
                await innerNode.ready;
                this.addNode(innerNode);
                const snapshotNode = node;
                Object.keys(innerNode.inputs).forEach((key) => {
                    const [_, ...rest] = key.split("-");
                    const snapKey = rest.join("-");
                    console.log(
                        key,
                        snapKey,
                        innerNode.inputs,
                        snapshotNode.inputs
                    );
                    if (
                        !deepEqual(
                            innerNode.inputs[key].subject.getValue(),
                            snapshotNode.inputs[snapKey]
                        ) &&
                        snapshotNode.inputs[snapKey]?.frozen
                    ) {
                        innerNode.inputs[key].subject.next(
                            snapshotNode.inputs[snapKey]
                        );
                    }
                });
            }
        }

        for (const connection of snapshot.connections) {
            if (!currentConnections.find((c) => c.id === connection.id)) {
                this.connections.add(connection);
                this.subscribeConnection(connection);
            }
        }

        return snapshot;
    }

    async addNode(node) {
        if (this.editorNode) {
            if (node.childComponents) {
                node.childComponents.forEach((component) =>
                    this.editorNode.appendChild(component)
                );
            } else if (node.component) {
                this.editorNode.appendChild(node.component);
            }
        } else {
            this.childComponents = [];
            if (node.childComponents) {
                node.childComponents.forEach((component) =>
                    this.childComponents.push(component)
                );
            } else if (node.component) {
                this.childComponents.push(node.component);
            }
        }
        this.nodes.add(node);
    }

    async removeNode(node) {
        if (node.component && this.editorNode) {
            this.editorNode.removeChild(node.component);
        }
        this.nodes.delete(node);
    }

    updateIO() {
        const currentInputs = Object.values(this.inputs);
        const currentOutputs = Object.values(this.outputs);

        const inputs = this.findUnconnectedPorts("inputs", true);
        const outputs = this.findUnconnectedPorts("outputs");
        // Remove inputs and outputs not in snapshot
        for (const input of currentInputs) {
            if (!inputs.find((i) => i.id === input.id)) {
                this.removeInput(input.key);
            }
        }

        for (const output of currentOutputs) {
            if (!outputs.find((o) => o.id === output.id)) {
                this.removeOutput(output.key);
            }
        }

        for (const input of inputs) {
            if (!this.inputs[input.key]) {
                const node = Array.from(this.nodes).find(
                    (n) => n.id === input.nodeId
                );
                const _input = node.inputs[input.key];
                if (_input.key.startsWith(`${this.id}-`) === false) {
                    _input.key = `${this.id}-${_input.key}`;
                }
                this.addInput(_input);
            }
        }

        for (const output of outputs) {
            if (!this.outputs[output.key]) {
                const node = Array.from(this.nodes).find(
                    (n) => n.id === output.nodeId
                );
                const _output = node.outputs[output.key];
                if (_output.key.startsWith(`${this.id}-`) === false) {
                    _output.key = `${this.id}-${_output.key}`;
                }
                this.addOutput(_output);
            }
        }
    }

    subscribeConnection(connection) {
        const { source, target } = connection;
        const sourceNode = Array.from(this.nodes).find((n) => n.id === source);
        const targetNode = Array.from(this.nodes).find((n) => n.id === target);
        targetNode.subscribe(connection, sourceNode);
    }

    unsubscribeConnection(connection) {
        const { target } = connection;
        const targetNode = Array.from(this.nodes).find((n) => n.id === target);
        targetNode.unsubscribe(connection);
    }
    /**
     * Utility function to find unconnected ports (either inputs or outputs)
     * @param {string} portType - Either 'inputs' or 'outputs'
     * @param {boolean} checkFrozen - Whether to consider the 'frozen' field (relevant for inputs)
     * @return {Array} - Array of unconnected ports
     */
    findUnconnectedPorts(portType, checkFrozen = false) {
        const { nodes, connections } = this;

        // Create a set to store connected port IDs for quick lookup
        const connectedPorts = new Set();

        // Field to check (either 'target' for inputs or 'source' for outputs)
        const fieldToCheck = portType === "inputs" ? "target" : "source";

        // Field to check (either 'targetInput' for inputs or 'sourceOutput' for outputs)
        const labelToCheck =
            portType === "inputs" ? "targetInput" : "sourceOutput";

        // Populate the set with connected port IDs
        connections.forEach((connection) => {
            const field = connection[fieldToCheck];
            const label = connection[labelToCheck];
            connectedPorts.add(label);
        });

        // Array to store ports that are unconnected
        const unconnectedPorts = [];

        // Loop through each node to check its ports
        nodes.forEach((node) => {
            const { id, [portType]: ports, name } = node;
            Object.values(ports || {}).forEach((port) => {
                const { label, subject } = port;

                // Check if the port is connected
                if (!connectedPorts.has(port.key)) {
                    if (
                        !checkFrozen ||
                        !(checkFrozen && subject.getValue()?.frozen)
                    ) {
                        // Add the port to the list

                        unconnectedPorts.push({
                            ...port,
                            nodeId: id,
                            nodeName: name,
                            portType,
                        });
                    }
                }
            });
        });

        return unconnectedPorts;
    }

    async transform() {}
}

Transformer.childClasses.set("CompositeTransformer", CompositeTransformer);
window.Composite = CompositeTransformer;
