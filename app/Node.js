import { SafeSubject } from "./safe-subject";

export class Transformer extends LitElement {
    static globals = new Map();
    static _sockets = {};
    static inputs = [];
    static outputs = [];
    static intermediates = [];
    static Component = DefaultComponent;
    static childClasses = new Map();
    static async deserialize(ide, data) {
        // Retrieve the child class constructor based on the class name
        const ChildClass = Transformer.childClasses.get(data.className);

        if (!ChildClass) {
            throw new Error(`Unknown class: ${data.className}`);
        }

        const transformer = new ChildClass(
            ide,
            data.canvasId,
            data.props,
            data.id
        );

        for (const key in data.inputs) {
            if (transformer.inputs[key]) {
                transformer.inputs[key].subject.next(data.inputs[key]);
            }
        }

        await new Promise((r) => setTimeout(r, 1000));

        // Restore any other properties from the serialized data
        return transformer;
    }
    inputs = {};
    outputs = {};
    intermediates = {};

    static getSocket(canvasId) {
        if (!canvasId) throw new Error("canvasId is undefined");
        this._sockets[canvasId] =
            this._sockets[canvasId] || new Classic.Socket(canvasId);
        return this._sockets[canvasId];
    }

    get socket() {
        return Transformer.getSocket(this.canvasId);
    }

    get canvas() {
        return this.ide.getCanvasById(this.canvasId);
    }

    get editor() {
        return this.canvas?.editor;
    }

    get area() {
        return this.canvas?.area;
    }

    get width() {
        return this.component.parentElement
            ? this.component.parentElement.clientWidth
            : 0;
    }

    get height() {
        return this.component.parentElement
            ? this.component.parentElement.clientHeight
            : 0;
    }

    constructor(
        ide,
        canvasId,
        dataOrConstructor = {},
        id = getUID().split("-").pop()
    ) {
        const name = isClassConstructor(dataOrConstructor)
            ? dataOrConstructor.toString().match(/\w+/g)[1]
            : dataOrConstructor.name || dataOrConstructor.className;

        super();
        this._selected = false;
        this.id = id;
        this.ready = new Promise((r) => (this.readyResolve = r));
        this.ide = ide;
        this.canvasId = canvasId;
        this.props = isClassConstructor(dataOrConstructor)
            ? {}
            : dataOrConstructor;
        if (!isClassConstructor(dataOrConstructor)) {
            this.id = dataOrConstructor.id || this.id;
        }

        const className = this.constructor.toString().match(/\w+/g)[1];

        // Check if the class is not in the map, and if not, add it
        if (!Transformer.childClasses.has(className)) {
            Transformer.childClasses.set(className, this.constructor);
        }

        this.init();
        this.postInit();
    }

    get selected() {
        return this._selected;
    }

    set selected(value) {
        this._selected = value;
        this.canvas.zoom();
        if (value) {
            this.editorNode.openUnsubscribed();
        } else {
            this.editorNode.closeAll();
        }
    }

    requestSnapshot() {
        this.ide.getCanvasById(this.canvasId).store.createSnapshot();
    }

    socketKey(label) {
        return `${this.id}-${label}`;
    }

    addInput(input) {
        const key = input.key || this.socketKey(input.label);
        input.key = key;
        super.addInput(key, input);
        this.editorNode?.requestUpdate();
    }

    addOutput(output) {
        const key = output.key || this.socketKey(output.label);
        output.key = key;
        super.addOutput(key, output);
        this.editorNode?.requestUpdate();
    }

    getInput(key) {
        // console.log(key, this.inputs, this.inputs[`${this.id}-${key}`]);
        return this.inputs[`${this.id}-${key}`];
    }

    getOutput(key) {
        // console.log(key, this.outputs, this.outputs[`${this.id}-${key}`]);
        return this.outputs[`${this.id}-${key}`];
    }

    init() {
        this.processIO(
            this.constructor.inputs,
            false,
            this.addInput.bind(this)
        );
        this.processIO(
            this.constructor.inputs
                .filter((i) => i.chainable)
                .concat(this.constructor.outputs),
            true,
            this.addOutput.bind(this)
        );
        for (const input of Object.values(this.inputs)) {
            if (input.chainable && input.chainable !== "manual") {
                input.subject.subscribe(this.getOutput(input.label).subject);
            }
        }

        this.processIntermediates(this.constructor.intermediates);

        this.incoming = new BehaviorSubject([]);
        this.outgoing = new BehaviorSubject([]);
        this.transform();
        this.readyResolve();
    }

    clearIO() {
        for (const key in this.inputs) {
            if (key.endsWith("config")) continue;
            this.removeInput(key);
        }

        for (const key in this.outputs) {
            this.removeOutput(key);
        }
    }

    getAllIncomingEdges() {
        return this.editor
            .getConnections()
            .filter((c) => c.target === this.id)
            .map((c) => ({
                connection: c,
                input: this.inputs[c.targetInput],
                output: this.editor.getNode(c.source).outputs[c.sourceOutput],
            }));
    }

    getAllOutgoingEdges() {
        return this.editor
            .getConnections()
            .filter((c) => c.source === this.id)
            .map((c) => ({
                connection: c,
                input: this.editor.getNode(c.target).inputs[c.targetInput],
                output: this.outputs[c.sourceOutput],
            }));
    }

    multiInputsToObject(operation, observablesArray) {
        const labels = observablesArray.map((item) => item.label);
        const observables = observablesArray.map((item) => item.subject.read);

        return rxjs[operation](observables).pipe(
            map((values) => {
                const combinedObject = {};
                for (let i = 0; i < labels.length; i++) {
                    combinedObject[labels[i]] = values[i];
                }
                return combinedObject;
            })
        );
    }

    async postInit() {
        //   debugger
        if (this.constructor.Component) {
            this.component = new this.constructor.Component();
            this.component.node = this;
        }

        while (!this.editor) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.editor.addPipe((context) => {
            // console.log("editor pipe spam", context.type);
            if (context.data.target === this.id) {
                if (context.type === "connectioncreated") {
                    // console.log(
                    //     "new connection created",
                    //     listener,
                    //     this.id,
                    //     context
                    // );
                    try {
                        this.subscribe(context.data);
                    } catch (error) {
                        debugger; //alert(error.message);
                        this.editor.removeConnection(context.data.id);
                    }
                } else if (context.type === "connectionremoved") {
                    this.unsubscribe(context.data);
                }

                this.incoming.next(this.getAllIncomingEdges());
            } else if (context.data.source === this.id) {
                this.outgoing.next(this.getAllOutgoingEdges());
            }
            return context;
        });
    }

    removeInput(key) {
        this.removeConnections(key);
        super.removeInput(key);
        this.editorNode?.requestUpdate();
    }

    removeOutput(key) {
        this.removeConnections(key);
        super.removeOutput(key);
        this.editorNode?.requestUpdate();
    }

    removeConnections(key) {
        const connections = this.editor.connections;
        const toRemove = connections.filter(
            (c) =>
                (c.targetInput == key && c.target == this.id) ||
                (c.sourceOutput == key && c.source == this.id)
        );

        for (const connection of toRemove) {
            this.editor.removeConnection(connection.id);
        }
    }

    serialize() {
        const serializedInputs = {};

        for (const key in this.inputs) {
            if (
                !this.inputs[key].subscription ||
                this.inputs[key].subject.getValue()?.frozen
            ) {
                serializedInputs[key] = this.inputs[key].subject.getValue();
            }
        }

        return {
            className: this.constructor.toString().match(/\w+/g)[1],
            inputs: serializedInputs,
            id: this.id,
            name: this.name,
            props: this.props,
            canvasId: this.canvasId,

            // Add any other properties you want to serialize
        };
    }

    hasConnection(label) {
        return this.editor.connections.some(
            (c) =>
                c.targetInput === this.socketKey(label) ||
                c.sourceOutput === this.socketKey(label)
        );
    }

    processIO(definitions, multipleConnections, addMethod) {
        for (const def of definitions) {
            const ioConfig = {
                ...def,
                socket: this.socket,
                subject: new BehaviorSubject(),
                validate: this.createValidateFunction(def),
                multipleConnections:
                    def.multipleConnections || multipleConnections,
                node: this,
            };
            const ioClass = multipleConnections
                ? TransformerOutput
                : TransformerInput;
            const ioInstance = new ioClass(ioConfig);
            addMethod(ioInstance);

            if (ioConfig.global) {
                const className = this.constructor.toString().match(/\w+/g)[1];
                const globalSubject =
                    this.constructor.globals.get(
                        `${className}-${ioConfig.label}`
                    ) || new BehaviorSubject(true);

                ioInstance.subject.subscribe(globalSubject);
                globalSubject.subscribe(ioInstance.subject);
                this.constructor.globals.set(
                    `${className}-${ioConfig.label}`,
                    globalSubject
                );
            }
        }
    }

    createValidateFunction(inputDef) {
        return () => true;
        return (outputDef) => {
            if (!inputDef.schema) return true;
            if (!outputDef.schema) return false;

            return true;
        };
    }

    processIntermediates(list) {
        for (const item of list) {
            this.intermediates[item.label] = item;
        }
    }

    transform() {
        // To be overridden by child class
    }

    lockQueue = Promise.resolve();

    async createNewMultipleInput(context, targetInput, index) {
        // const unlock = await this.lock();

        try {
            if (index) {
                if (this.inputs[`${context.targetInput}_${index}`]) {
                    // do nothing, input already exists
                    return;
                }
            } else {
                index = 1;
                while (this.inputs[`${context.targetInput}_${index}`]) {
                    index++;
                }
            }

            const newInput = new TransformerInput({
                ...targetInput,
                label: targetInput.label + "_" + index,
                multipleConnections: false,
                subject: new BehaviorSubject(),
                key: undefined,
            });

            this.addInput(newInput);

            await this.editor.removeConnection(context.id);

            const newConnection = {
                id: getUID(),
                source: context.source,
                sourceOutput: context.sourceOutput,
                target: this.id,
                targetInput: newInput.key,
            };

            this.editor.addConnection(newConnection);
        } finally {
            // unlock();
        }
    }

    lock() {
        let unlockNext;

        // Add new lock to the queue
        const lock = new Promise((unlock) => {
            unlockNext = unlock;
        });

        const lockPromise = this.lockQueue.then(() => unlockNext);
        this.lockQueue = this.lockQueue.then(() => lock);

        return lockPromise;
    }

    async subscribe(context, node) {
        if (context.target !== this.id) return;
        await this.ready;

        const sourceNode = node || this.editor.getNode(context.source);
        await sourceNode.ready;
        let sourceOutput = sourceNode.outputs[context.sourceOutput];
        let targetInput = this.inputs[context.targetInput];
        let index = context.targetInput.split("_")[1];
        if (!targetInput) {
            let prior = context.targetInput.split("_")[0];
            if (this.inputs[prior]) {
                context.targetInput = prior;
                targetInput = this.inputs[prior];
            } else {
                targetInput = this.getInput(
                    context.targetInput.split("-").pop()
                );
                if (!targetInput) {
                    throw new Error("cant find target input");
                }
            }
        }
        // Check if the input already has a subscription
        if (targetInput.subscription) {
            if (!targetInput.multipleConnections) {
                throw new Error("Input already has a subscription.");
            }

            targetInput.subscription?.unsubscribe();
            targetInput.multiInputs = this.editor
                .getConnections()
                .filter((c) => {
                    return (
                        c.targetInput === targetInput.key &&
                        c.target === this.id
                    );
                })
                .map((c) => {
                    const sourceNode = this.editor.getNode(c.source);
                    let sourceOutput = sourceNode.outputs[c.sourceOutput];
                    return sourceOutput;
                });

            targetInput.subscription = this.multiInputsToObject(
                targetInput.multipleConnections,
                targetInput.multiInputs
            ).subscribe((v) => targetInput.subject.next(v));
            return;
        }

        // Validate the schema
        if (!targetInput.validate(sourceOutput)) {
            throw new Error("Schema validation failed.");
        }

        // Subscribe the input to the output
        targetInput.subscription = sourceOutput.subject.subscribe((value) => {
            targetInput.subject.next(value);
        });
    }

    unsubscribe(context) {
        if (context.target !== this.id) return;

        const targetInput = this.inputs[context.targetInput];

        // Unsubscribe the input
        if (targetInput.subscription) {
            targetInput.subscription.unsubscribe();
            delete targetInput.subscription;
        }
    }

    data() {}
}
