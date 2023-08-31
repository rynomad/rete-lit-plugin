import { debounceTime, tap, map } from "https://esm.sh/rxjs";
import {
    Transformer,
    TransformerInput,
    TransformerOutput,
} from "../transformer.js";

export class CompositeTransformer extends Transformer {
    constructor(ide, canvasId, props = {}) {
        super(ide, canvasId, props);

        this.nodes = new Set();
        this.connections = new Set();
    }

    init() {
        this.snapshots = this.ide.snapshots(this.props.canvasId).read;
        this.snapshots
            .pipe(
                debounceTime(500),
                tap((snapshots) =>
                    console.log("Composite snapshot", snapshots)
                ),
                map(this.consumeSnapshot.bind(this)),
                map(this.updateIO.bind(this))
            )
            .subscribe(() => {
                console.log("Composite snapshot consumed");
                console.log(this.node);
                this.node.requestUpdate();
            });

        this.transform();
    }

    consumeSnapshot(snapshot) {
        const currentNodes = Array.from(this.nodes.values());
        const currentConnections = Array.from(this.connections.values());

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
                    if (
                        !deepEqual(
                            node.inputs[key].subject.getValue(),
                            snapshotNode.inputs[key]
                        )
                    ) {
                        node.inputs[key].subject.next(snapshotNode.inputs[key]);
                    }
                });
            }
        }

        // Add nodes and connections from snapshot
        for (const node of snapshot.nodes) {
            if (!currentNodes.find((n) => n.id === node.id)) {
                this.addNode(Transformer.deserialize(this.ide, node));
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

    addNode(node) {
        if (node.component) {
            this.node.appendChild(node.component);
        }
        this.nodes.add(node);
    }

    removeNode(node) {
        if (node.component) {
            this.node.removeChild(node.component);
        }
        this.nodes.delete(node);
    }

    updateIO() {
        const currentInputs = Object.values(this.inputs);
        const currentOutputs = Object.values(this.outputs);

        const inputs = this.findUnconnectedPorts("inputs", true);
        const outputs = this.findUnconnectedPorts("outputs");
        // debugger;
        // Remove inputs and outputs not in snapshot
        for (const input of currentInputs) {
            if (!inputs.find((i) => i.id === input.id)) {
                this.removeInput(input.hash);
            }
        }

        for (const output of currentOutputs) {
            if (!outputs.find((o) => o.id === output.id)) {
                this.removeOutput(output.hash);
            }
        }

        for (const input of inputs) {
            if (!this.inputs[input.hash]) {
                const node = Array.from(this.nodes).find(
                    (n) => n.id === input.nodeId
                );
                this.addInput(input.hash, node.inputs[input.portLabel]);
            }
        }

        for (const output of outputs) {
            if (!this.outputs[output.hash]) {
                const node = Array.from(this.nodes).find(
                    (n) => n.id === output.nodeId
                );
                this.addOutput(output.hash, node.outputs[output.portLabel]);
            }
        }
    }

    addInput(hash, input) {
        input.hash = hash;
        super.addInput(hash, input);
    }

    addOutput(hash, output) {
        output.hash = hash;
        super.addOutput(hash, output);
    }

    removeInput(hash) {
        this.removeConnections(hash);
        super.removeInput(hash, input);
    }

    removeOutput(hash) {
        this.removeConnections(hash);
        super.removeOutput(hash);
    }

    removeConnections(hash) {
        const connections = this.editor.connections;
        const toRemove = connections.filter(
            (c) =>
                (c.targetInput == hash && c.target == this.id) ||
                (c.sourceOutput == hash && c.source == this.id)
        );

        for (const connection of toRemove) {
            this.editor.removeConnection(connection.id);
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
        const targetNode = this.nodes.find((n) => n.id === target);
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
            connectedPorts.add(`${field}-${label}`);
        });

        // Array to store ports that are unconnected
        const unconnectedPorts = [];

        // Loop through each node to check its ports
        nodes.forEach((node) => {
            const { id, [portType]: ports, name } = node;
            Object.values(ports || {}).forEach((port) => {
                const { label, frozen } = port;

                // Check if the port is connected
                if (!connectedPorts.has(`${id}-${label}`)) {
                    if (!checkFrozen || (checkFrozen && !frozen)) {
                        // Add the port to the list
                        unconnectedPorts.push({
                            hash: `${id}-${label}`,
                            nodeId: id,
                            nodeName: name,
                            portLabel: label,
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
