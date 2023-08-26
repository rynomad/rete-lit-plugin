import { ClassicPreset as Classic, NodeEditor } from "https://esm.sh/rete";
import { AreaExtensions, AreaPlugin } from "https://esm.sh/rete-area-plugin";
import {
    LitPlugin,
    Presets as LitPresets,
} from "/dist/rete-litv-plugin.esm.local.js";
import { DataflowEngine } from "https://esm.sh/rete-engine";
import {
    AutoArrangePlugin,
    ArrangeAppliers,
    Presets as ArrangePresets,
} from "https://esm.sh/rete-auto-arrange-plugin";
import {
    ConnectionPlugin,
    Presets as ConnectionPresets,
} from "https://esm.sh/rete-connection-plugin";
import {
    ContextMenuPlugin,
    Presets as ContextMenuPresets,
} from "https://esm.sh/rete-context-menu-plugin";
import { MinimapPlugin } from "https://esm.sh/rete-minimap-plugin";
import {
    ReroutePlugin,
    RerouteExtensions,
} from "https://esm.sh/rete-connection-reroute-plugin";
import { DockPlugin, DockPresets } from "https://esm.sh/rete-dock-plugin";
import { LitElement, css, html } from "https://esm.sh/lit";
import {unsafeHTML} from 'https://esm.sh/lit/directives/unsafe-html'
import {
    BehaviorSubject,
    combineLatest,
    map,
    mergeMap,
    filter,
    debounceTime,
    tap,
    bindCallback,
    distinctUntilChanged,
} from "https://esm.sh/rxjs";
// ... rest of the code ...
import React from "https://esm.sh/react@18.2.0?bundle";
import ReactDOM from "https://esm.sh/react-dom@18.2.0?bundle";
import Form from "https://esm.sh/@rjsf/bootstrap-4?alias=lodash:lodash-es,deps=react@18.2.0,react-dom@18.2.0";
import validator from "https://esm.sh/@rjsf/validator-ajv8?alias=lodash:lodash-es";
import { DOMSocketPosition } from 'https://esm.sh/rete-render-utils'
import { fas } from "https://esm.sh/@fortawesome/free-solid-svg-icons";
import { icon } from "https://esm.sh/@fortawesome/fontawesome-svg-core";
import * as yaml from "https://esm.sh/js-yaml@4.1.0";
import {PropagationStopper, CardStyleMixin} from './mixins.js'
import 'https://esm.sh/@dile/dile-pages/dile-pages.js'
import 'https://esm.sh/@dile/dile-tabs/dile-tabs.js'
import { sanitizeAndRenderYaml } from './util.js'
import bootstrapCss from "./bootstrap.css.js";
import { OpenAI } from "https://esm.sh/openai";
import {marked} from "https://esm.sh/marked";
import { openDB } from "https://esm.sh/idb";
import deepEqual from "https://esm.sh/fast-deep-equal";

class BetterDomSocketPosition extends DOMSocketPosition {
    attach(scope) {
        if (this.area) return;
        if (!scope.hasParent()) return;
        this.area = scope.parentScope()

        // eslint-disable-next-line max-statements, complexity
        this.area.addPipe(async (context) => {
            if (context.type === "rendered" && context.data.type === "socket") {
                const { nodeId, key, side, element } = context.data;

                const position = await this.calculatePosition(
                    nodeId,
                    side,
                    key,
                    element
                );

                if (position) {
                    this.sockets.add({ nodeId, key, side, element, position });
                    this.emitter.emit({ nodeId, key, side });
                }
            } else if (context.type === "unmount") {
                this.sockets.remove(context.data.element);
            } else if (context.type === "nodetranslated") {
                this.emitter.emit({ nodeId: context.data.id });
            } else if (context.type === "noderesized") {
                const { id: nodeId } = context.data;

                await Promise.all(
                    this.sockets
                        .snapshot()
                        .filter(
                            (item) =>
                                item.nodeId === context.data.id 
                        )
                        .map(async (item) => {
                            const { side, key, element } = item;
                            const position = await this.calculatePosition(
                                nodeId,
                                side,
                                key,
                                element
                            );

                            if (position) {
                                item.position = position;
                            }
                        })
                );
                this.emitter.emit({ nodeId });
            } else if (
                context.type === "render" &&
                context.data.type === "connection"
            ) {
                const { source, target } = context.data.payload;
                const nodeId = source || target;

                this.emitter.emit({ nodeId });
            }
            return context;
        });
    }
}

const RJSFComponent = CardStyleMixin(
    PropagationStopper(
        class RJSFComponentBase extends LitElement {
            static styles = [bootstrapCss, css`
                :host {
                    display: block;
                }
            `];

            static properties = {
                props: { type: Object },
            };

            // Create a new Subject to receive change events
            subject = new BehaviorSubject();
            debounceTime = 5000;

            constructor() {
                super();
                this._props = {
                    schema: {},
                    uiSchema: {},
                    formData: {},
                    onSubmit: () => {},
                    onChange: (e) => {
                        console.log("onchange");
                        this.form.next(e.formData);
                    }, // Send change events to the Subject
                    validator: validator,
                };
                console.log("props?", this.props);
            }

            firstUpdated() {
                const reactWrapper = document.createElement("react-wrapper");
                reactWrapper.stylesheet =
                    "https://esm.sh/bootstrap@4/dist/css/bootstrap.min.css";
                reactWrapper.reactComponent = Form;
                reactWrapper.props = { ...this._props, ...this.props };
                console.log(reactWrapper.props)
                this.appendChild(reactWrapper);
            }

            render() {
                return html`<div style="font-size: 1.3rem; font-weight: bold;">${this.props.label}</div><slot></slot>`; // Exposed slot for the React content
            }
        }
    )
);
customElements.define("rjsf-component", RJSFComponent);


class ReactWrapper extends LitElement {
    static styles = [bootstrapCss, css`
        :host {
            display: block;
        }
    `];

    static properties = {
        reactComponent: { type: Object },
        props: { type: Object },
        stylesheet: { type: String },
    };

    reactRoot = null;


    constructor() {
        super();
        this.reactComponent = null;
        this.props = {};
    }

    firstUpdated() {
        console.log("first updated");
        this.reactRoot = this.shadowRoot.querySelector('#react-root')
        this.renderReactComponent();
        
    }

    renderReactComponent() {
        console.log("render");
        ReactDOM.render(
            React.createElement(this.reactComponent, this.props),
            this.reactRoot
        );
        
    }

    render() {
        console.log("render react");
        return html`<div id="react-root">`; // Removing link tag from render since we're handling it in firstUpdated
    }
}

customElements.define("react-wrapper", ReactWrapper);


function classicConnectionPath(points, curvature) {
    let [{ x: x1, y: y1 }, { x: x2, y: y2 }] = points;

    x1 -= 12;
    x2 += 12;
    y1 += 12;
    y2 -= 12;

    const horizontal = Math.abs(x1 - x2);

    if (y1 === y2) {
        return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    const hy1 = y1 + Math.max(horizontal / 2, Math.abs(y2 - y1)) * curvature;
    const hy2 = y2 - Math.max(horizontal / 2, Math.abs(y2 - y1)) * curvature;

    return `M ${x1} ${y1} C ${x1} ${hy1} ${x2} ${hy2} ${x2} ${y2}`;
}

export class Connection extends LitElement {
    static styles = css`
        svg {
            overflow: visible !important;
            position: absolute;
            pointer-events: none;
            width: 9999px;
            height: 9999px;
        }
        path {
            fill: none;
            stroke-width: 5px;
            stroke: steelblue;
            pointer-events: auto;
        }
    `;

    static properties = {
        data: { type: Object },
        start: { type: Object },
        end: { type: Object },
        curvature: { type: Number },
    };

    constructor() {
        super();
        this.data = {};
        this.start = {};
        this.end = {};
        this.curvature = 0.5; // Default curvature value
    }

    render() {
        const path = classicConnectionPath(
            [this.start, this.end],
            this.curvature
        );
        return html`
            <svg data-testid="connection">
                <path d=${path}></path>
            </svg>
        `;
    }
}

customElements.define("custom-connection-component", Connection);

const socket = new Classic.Socket("socket");

class TransformerInput extends Classic.Input {
    constructor(inputConfig) {
        super(
            inputConfig.socket,
            inputConfig.label,
            inputConfig.multipleConnections
        );

        // Assign all properties from the inputConfig object to this class instance
        Object.assign(this, inputConfig);
        this.showControl = false;
    }
}

class TransformerOutput extends Classic.Output {
    constructor(inputConfig) {
        super(
            inputConfig.socket,
            inputConfig.label,
            inputConfig.multipleConnections
        );

        // Assign all properties from the inputConfig object to this class instance
        Object.assign(this, inputConfig);
        this.showControl = false;
    }
}

const TransformerDebugCard = PropagationStopper(CardStyleMixin(
    class extends LitElement {
        static get properties() {
            return {
                inputs: { type: Object },
                outputs: { type: Object },
                intermediates: { type: Object },
            };
        }

        static styles = css`
            :host {
                max-width: 500px;
            }
            .debug-header {
                background-color: #f0f0f0; /* Adjust as needed */
                font-size: 18px;
                font-weight: bold;
                padding: 10px;
                text-align: center;
                border: 1px solid #ccc; /* Adjust as needed */
            }
            .scrollable-area {
                overflow-y: auto; // enables scrollbar
                flex-grow: 1;
                max-height: 500px;
            }
            table {
                background-color: #fafafa;
                border: 1px solid #ccc;
                width: 100%;
                border-collapse: collapse;
            }

            thead th {
                position: sticky;
                top: 0;
                background: #f0f0f0; /* Adjust as needed */
                z-index: 1; /* Ensures header stays on top */
            }
            th:nth-child(1),
            td:nth-child(1) {
                width: 50px; /* Fixed width for "Type" column */
            }

            th:nth-child(2),
            td:nth-child(2) {
                width: 50px; /* Fixed width for "Label" column */
            }

            tbody tr td:nth-child(1) div,
            tbody tr td:nth-child(2) div {
                position: sticky;
                top: 5px;
                background: #fafafa; /* Same as cell background color */
                margin: 0; /* Remove any default margin */
                padding: 0; /* Remove any default padding */
                align-self: flex-start; /* Align to the top */
            }

            td {
                vertical-align: top; /* Align content to the top of the cell */
            }

            tbody tr td:first-child,
            tbody tr td:nth-child(2) {
                position: sticky;
                left: 0;
                background: #fafafa; /* Adjust as needed */
                z-index: 1; /* Ensures sticky cells stay on top */
            }

            th,
            td {
                padding: 10px;
                border: 1px solid #ccc;
            }

            pre {
                white-space: pre-wrap; /* Preserve spaces and line breaks */
                word-wrap: break-word; /* Allow long words to be able to break and wrap onto the next line */
            }
        `;

        connectedCallback() {
            super.connectedCallback();
            // Attach observers for inputs, outputs, and intermediates
            for (const key of ["inputs", "outputs", "intermediates"]) {
                for (const label in this[key]) {
                    this[key][label].subject.subscribe((v) => {
                        this.requestUpdate();
                    });
                }
            }
        }

        render() {
            return html`
                <div class="debug-header">Debug Values</div>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Label</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                </table>
                <div class="scrollable-area">
                    <!-- Scrollable div -->
                    <table>
                        <tbody>
                            ${this.renderRows("Input", this.inputs)}
                            ${this.renderRows("Output", this.outputs)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        renderRows(type, ioObject) {
            return ioObject.map((entry) => {
                const value = entry.subject
                    ? entry.subject.getValue()
                    : null;
                const formattedValue = sanitizeAndRenderYaml(value); // Convert JSON to YAML

                return html`
                    <tr>
                        <td><div>${type}</div></td>
                        <td><div>${entry.label}</div></td>
                        <td><pre>${formattedValue}</pre></td>
                    </tr>
                `;
            });
        }

        // renderRows method same as the original component
    }
))
class TabHeader extends LitElement {
    static styles = css`
        :host {
            display: flex;
            justify-content: flex-end;
            margin-top: 0.4rem;
            border: none;
            background-color: transparent;
        }
        dile-tab {
            flex-grow: 1;
            text-align: center;
            background-color: transparent;
            border: none;
            transition: background-color 0.3s ease;
            margin: 0;
        }
        dile-tab:hover,
        dile-tab.open:hover {
            background-color: rgba(0, 0, 0, 0.1); /* darkening on hover */
        }
        dile-tab.open {
            background-color: rgba(
                255,
                255,
                255,
                0.1
            ); /* lightening when open */
        }
        dile-tab.icon {
            display: flex; /* Allow centering */
            align-items: flex-start; /* Vertical centering */
            justify-content: center; /* Horizontal centering */
            flex-shrink: 0; /* Prevent shrinking */
            flex-grow: 0;
        }
        dile-tab.icon .icon-svg {
            width: 20px; /* Fill the parent container */
            height: 20px; /* Fill the parent container */
            transform: translateY(-3px);
        }
        dile-tabs {
            width: 100%;
            justify-content: end;
        }
    `;

    static properties = {
        inputs: { type: Array },
        openPages: { type: Array },
        handleToggle: { type: Function },
    };

    render() {
        return html`
            <dile-tabs
                id="select2"
                attrForSelected="name"
                selectorId="selector"
                @dile-selected-changed=${this.handleToggle}
            >
                ${this.inputs.map(
                    (entry) => html`<dile-tab
                        class="${this.openPages.includes(entry.label)
                            ? "open"
                            : ""} ${entry.icon ? "icon" : ""}"
                        icon="label_important"
                        name="${entry.label}"
                        selected="false"
                    >
                        ${entry.icon
                            ? html`<div class="icon-svg">${entry.icon}</div>`
                            : entry.label}
                    </dile-tab>`
                )}
            </dile-tabs>
        `;
    }
}

customElements.define("tab-header", PropagationStopper(TabHeader));

class CustomTabs extends LitElement {
    static styles = css`
        main.selectionlayout {
            --dile-tab-selected-background-color: transparent; /* or transparent */
            --dile-tab-background-color: transparent; /* or transparent */
            --dile-tab-border-radius: 0; /* or initial */
            --dile-tab-selected-line-color: transparent; /* or initial */
            --dile-tab-selected-line-height: 0; /* or initial */
            --dile-tab-selected-text-color: dimgray; /* or initial */
            --dile-tab-text-color: dimgray; /* or initial */
            --dile-tab-text-transform: uppercase; /* or initial */
            display: flex;
            flex-direction: column;
        }
        .name-heading {
            text-align: center;
            padding: 2rem;
            font-size: 1.3rem;
            font-weight: bold;
        }
        main.selectionlayout dile-pages {
            margin: 0;
            padding: 0;
        }
        main.selectionlayout dile-page {
            margin: 0;
            padding: 0;
        }
        main.selectionlayout dile-pages h2 {
            margin-top: 0;
        }
    `;

    static properties = {
        inputs: { type: Array },
        name: {type: String}
    };

    constructor() {
        super();
        this.inputs = [];
        // Use an array to keep track of open tabs
        this.openPages = [];
    }

    handleToggle(e) {
        const selectedTab = e.detail.selected;
        const index = this.openPages.indexOf(selectedTab);
        // If the tab is already open, remove it from the array; otherwise, add it
        if (index >= 0) {
            this.openPages.splice(index, 1);
        } else {
            this.openPages.push(selectedTab);
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <main class="selectionlayout">
                <tab-header
                    .inputs=${this.inputs}
                    .openPages=${this.openPages}
                    .handleToggle=${this.handleToggle.bind(this)}
                ></tab-header>

                <div class="name-heading">${this.name}</div>
                ${this.inputs.map((entry) => {
                    const open = !!this.openPages.find(
                        (input) => input === entry.label
                    );
                    if (entry.html) {
                        return entry.html(open);
                    }
                    console.log(entry);
                    return html`
                        <rjsf-component
                            is-open="${open}"
                            .props="${entry}"
                            style="${entry.style}"
                        ></rjsf-component>
                    `;
                })}
            </main>
        `;
    }
}

customElements.define('custom-tabs', CustomTabs);


customElements.define("transformer-debug-card", TransformerDebugCard);




class AddNode extends Classic.Node {
    constructor(change, update) {
        super("Add");
        this.height = 190;
        this.width = 180;
        this.update = update;
        const left = new Classic.Input(socket, "Left");
        const right = new Classic.Input(socket, "Right");
        left.addControl(
            new Classic.InputControl("number", { initial: 0, change })
        );
        right.addControl(
            new Classic.InputControl("number", { initial: 0, change })
        );
        this.addInput("left", left);
        this.addInput("right", right);
        this.addControl(
            "value",
            new Classic.InputControl("number", { readonly: true })
        );
        this.addOutput("value", new Classic.Output(socket, "Number"));
    }
    data(inputs) {
        const leftControl = this.inputs.left.control;
        const rightControl = this.inputs.right.control;
        const { left, right } = inputs;
        const value =
            (left ? left[0] : leftControl.value || 0) +
            (right ? right[0] : rightControl.value || 0);
        this.controls.value.setValue(value);
        if (this.update) this.update(this.controls.value);
        return { value };
    }
}

class DefaultComponent extends LitElement {
    constructor() {
        super()
    }
    render() {
        return html``
    }
}


customElements.define("transformer-default-component", DefaultComponent);

class Transformer extends Classic.Node {
    static socket = socket;
    static inputs = [];
    static outputs = [];
    static intermediates = [];
    static Component = DefaultComponent;
    static childClasses = new Map();
    static deserialize(data, editor, area) {
        // Retrieve the child class constructor based on the class name
        const ChildClass = Transformer.childClasses.get(data.className);

        if (!ChildClass) {
            throw new Error(`Unknown class: ${data.className}`);
        }

        const transformer = new ChildClass(editor, area);
        transformer.id = data.id;

        for (const key in data.inputs) {
            if (transformer.inputs[key]) {
                transformer.inputs[key].subject.next(data.inputs[key]);
            }
        }

        // Restore any other properties from the serialized data
        return transformer;
    }
    inputs = {};
    outputs = {};
    intermediates = {};
    editor;

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

    constructor(name, editor, area) {
        console.log("construct transfromer", name);
        super(name);
        this.name = name;

        const className = this.constructor.toString().match(/\w+/g)[1];

        // Check if the class is not in the map, and if not, add it
        if (!Transformer.childClasses.has(className)) {
            Transformer.childClasses.set(className, this.constructor);
        }

        this.area = area;
        this.editor = editor;
        this.processIO(
            this.constructor.inputs,
            false,
            this.addInput.bind(this)
        );
        this.processIO(
            this.constructor.outputs,
            true,
            this.addOutput.bind(this)
        );
        this.processIntermediates(this.constructor.intermediates);
        this.transform();
        //   debugger
        if (this.constructor.Component) {
            this.component = new this.constructor.Component();
            this.component.inputs = this.inputs;
            this.component.outputs = this.outputs;
            this.component.intermediates = this.intermediates;
        }

        this.editor.addPipe((context) => {
            if (context.data.target === this.id) {
                if (context.type === "connectioncreated") {
                    console.log('new connection created', this.id, context);
                    try {
                        this.subscribe(context.data);
                    } catch (error) {
                        alert(error.message);
                        this.editor.removeConnection(context.data.id);
                    }
                } else if (context.type === "connectionremoved") {
                    this.unsubscribe(context.data);
                }
            }
            return context;
        });
    }

    serialize() {
        const serializedInputs = {};

        for (const key in this.inputs) {
            if (!this.inputs[key].subscription) {
                serializedInputs[key] = this.inputs[key].subject.getValue();
            }
        }

        return {
            className: this.constructor.toString().match(/\w+/g)[1],
            inputs: serializedInputs,
            id: this.id,
            // Add any other properties you want to serialize
        };
    }

    processIO(definitions, multipleConnections, addMethod) {
        for (const def of definitions) {
            const ioConfig = {
                ...def,
                socket: this.constructor.socket,
                subject: new BehaviorSubject(),
                validate: this.createValidateFunction(def),
                multipleConnections: multipleConnections,
            };
            const ioClass = multipleConnections
                ? TransformerOutput
                : TransformerInput;
            const ioInstance = new ioClass(ioConfig);
            addMethod(def.label, ioInstance);
        }
    }

    createValidateFunction(inputDef) {
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

    subscribe(context) {
        if (context.target !== this.id) return;

        const sourceNode = this.editor.getNode(context.source);
        const sourceOutput = sourceNode.outputs[context.sourceOutput];
        const targetInput = this.inputs[context.targetInput];

        // Check if the input already has a subscription
        if (targetInput.subscription) {
            throw new Error("Input already has a subscription.");
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


class SnapshotTransformer extends Transformer {
    static inputs = [
        {
            label: "snapshot",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    nodes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                className: {
                                    type: "string",
                                },
                                inputs: {
                                    type: "object",
                                },
                                id: {
                                    type: "string",
                                },
                            },
                            required: ["className", "inputs", "id"],
                        },
                    },
                    connections: {
                        type: "array",
                        items: {
                            type: "object",
                        },
                    },
                },
                required: ["nodes", "connections"],
            },
        },
    ];
    static outputs = [
        {
            label: "snapshot",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    nodes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                className: {
                                    type: "string",
                                },
                                inputs: {
                                    type: "object",
                                },
                                id: {
                                    type: "string",
                                },
                            },
                            required: ["className", "inputs", "id"],
                        },
                    },
                    connections: {
                        type: "array",
                        items: {
                            type: "object",
                        },
                    },
                },
                required: ["nodes", "connections"],
            },
        },
    ];

    constructor(editor, area) {
        super("Snapshot", editor, area);
    }

    transform() {

        this.lock = new BehaviorSubject(false);
        this.lock.subscribe((v) => console.log('lock',v))
        this.debouncer = new BehaviorSubject(null)

        requestIdleCallback(() => {
        this.editor.addPipe((context) => {
            if (
                [
                    "nodecreated",
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                ].includes(context.type)
            ) {
                if (!this.lock.getValue()) {
                    console.log("got event in snapshotter", context);
                    const nodes = this.editor
                        .getNodes()
                        .map((node) => node.serialize());
                    const connections = this.editor.getConnections();
                    this.outputs.snapshot.subject.next({ nodes, connections });
                }
            }
            return context;
        });
        })


        this.inputs.snapshot.subject
            .pipe(
                distinctUntilChanged(deepEqual),
                filter((snapshot) => snapshot),
                tap(() => this.lock.next(true)),
                mergeMap(async (snapshot) => {
                    const currentNodes = this.editor.getNodes();
                    const currentConnections = this.editor.getConnections();

                    // Remove nodes and connections not in snapshot
                    await Promise.all(currentNodes.map(async (node) => {
                        const snapshotNode = snapshot.nodes.find(
                            (n) => n.id === node.id
                        );
                        if (!snapshotNode) {
                            await this.editor.removeNode(node.id);
                        } else {
                            // Update node inputs if they don't match snapshot
                            Object.keys(node.inputs).forEach((key) => {
                                if (
                                    !deepEqual(
                                        node.inputs[key].value,
                                        snapshotNode.inputs[key]
                                    )
                                ) {
                                    node.inputs[key].subject.next(
                                        snapshotNode.inputs[key]
                                    );
                                }
                            });
                        }
                    }));

                    await Promise.all(currentConnections.map(async (connection) => {
                        if (
                            !snapshot.connections.find(
                                (c) => c.id === connection.id
                            )
                        ) {
                            await this.editor.removeConnection(connection.id);
                        }
                    }));

                    // Add nodes and connections from snapshot
                    await Promise.all(snapshot.nodes.map(async (node) => {
                        if (!currentNodes.find((n) => n.id === node.id)) {
                            await this.editor.addNode(Transformer.deserialize(node, this.editor, this.area));
                        }
                    }));

                    await Promise.all(snapshot.connections.map(async (connection) => {
                        if (
                            !currentConnections.find(
                                (c) => c.id === connection.id
                            )
                        ) {
                            await this.editor.addConnection(connection);
                        }
                    }));
                }),
                tap(() => this.lock.next(false))
            ).subscribe(console.log.bind(console))
    }
}

class IndexedDBTransformer extends Transformer {
    static inputs = [
        {
            label: "config",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    storeName: {
                        type: "string",
                    },
                    history: {
                        type: "integer",
                        minimum: 0,
                        default: 0,
                    },
                },
                required: ["storeName"],
            },
        },
        {
            label: "data",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                additionalProperties: true,
            },
        },
    ];
    static outputs = [
        {
            label: "data",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                additionalProperties: true,
            },
        },
    ];

    constructor(editor, area) {
        super("IndexedDB", editor, area);
    }

    async transform() {

        async function getDB(config) {
                        let db;

                        // Open the database without specifying a version to get the current version
                        db = await openDB("myDB");
                        let dbVersion = db.version;

                        if (
                            !db.objectStoreNames.contains(
                                config.storeName
                            )
                        ) {
                            // Close the database so it can be reopened with a higher version number
                            db.close();

                            // Increment the version number
                            dbVersion++;

                            // Reopen the database with a higher version number and create the store
                            db = await openDB("myDB", dbVersion, {
                                upgrade(db) {
                                    db.createObjectStore(config.storeName, {
                                        autoIncrement: true,
                                    });
                                },
                            });
                        }
            return db;
        }
        
        combineLatest(
            this.inputs.data.subject.pipe(
                filter((e) => e),
                distinctUntilChanged(deepEqual)
            ),
            this.inputs.config.subject.pipe(
                filter((e) => e),
                distinctUntilChanged(deepEqual)
            )
        )
            .pipe(
                mergeMap(async ([data, config]) => {
                    console.log('db write', data, config)
                    const db = await getDB(config);

                    const tx = db.transaction(config.storeName, "readwrite");
                    const store = tx.objectStore(config.storeName);
                    await store.put(data);
                    await tx.done;
                    await db.close();

                    return config;
                })
            )
            .subscribe(this.inputs.config.subject);

        this.inputs.config.subject.pipe(
            distinctUntilChanged(deepEqual),
            filter(e => e),
            mergeMap(async (config) => {
                const db = await getDB(config)
                let cursor = await db
                    .transaction(config.storeName)
                    .store.openCursor(null, "prev");
                let count = 0;
                let output = cursor?.value;
                while (cursor && count < config.history) {
                    cursor = await cursor.continue();
                    output = cursor.value;
                    count++;
                }
                await db.close()
                return output;
            }),
            filter(e => e)
        ).subscribe(this.outputs.data.subject)
        
    }
}
class ArithmeticTransformer extends Transformer {
    static inputs = [
        { label: "left", schema: { type: "number" } },
        { label: "right", schema: { type: "number" } },
    ];
    static outputs = [
        { label: "add", schema: { type: "number" } },
        { label: "subtract", schema: { type: "number" } },
        { label: "multiply", schema: { type: "number" } },
        { label: "divide", schema: { type: "number" } },
    ];

    constructor(editor, area) {
        super("Arithmetic", editor, area);
    }

    transform() {
        const arithmeticObservable = combineLatest([
            this.inputs["left"].subject,
            this.inputs["right"].subject,
        ]).pipe(
            map(([left, right]) => ({
                add: left + right,
                subtract: left - right,
                multiply: left * right,
                divide: left / right,
            }))
        );

        arithmeticObservable.subscribe((result) => {
            this.outputs["add"].subject.next(result.add);
            this.outputs["subtract"].subject.next(result.subtract);
            this.outputs["multiply"].subject.next(result.multiply);
            this.outputs["divide"].subject.next(result.divide);
        });
    }
}
class PromptTransformer extends Transformer {
    static inputs = [
        {
            label: "prompt",
            style: 'width: 500px;',
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        enum: ["user", "system", "assistant"],
                        default: "user",
                    },
                    content: {
                        type: "string",
                        format: "textarea",
                    },
                },
                required: ["content"],
            },
            user: true,
            uiSchema: {
                content: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 5,
                    },
                    classNames: "my-custom-class my-custom-class-wider",
                },
            },
        },
        {
            label: "chat",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        role: {
                            type: "string",
                            enum: ["system", "user", "assistant"],
                        },
                        content: {
                            type: "string",
                        },
                    },
                    required: ["role", "content"],
                },
            },
        },
    ];
    static outputs = [
        {
            label: "chat",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        role: {
                            type: "string",
                            enum: ["system", "user", "assistant"],
                        },
                        content: {
                            type: "string",
                        },
                    },
                    required: ["role", "content"],
                },
            },
        },
    ];

    constructor(editor, area) {
        super("Prompt", editor, area);
    }

    transform() {
        combineLatest([
            this.inputs["prompt"].subject.pipe(filter((i) => i)),
            this.inputs["chat"].subject.pipe(debounceTime(1000), distinctUntilChanged(deepEqual) ),
        ])
            .pipe(
                map(([prompt, chat]) => {
                    console.log('prompt', prompt, chat)
                    return [
                    ...(chat || []),
                    { role: prompt.role || "user", content: prompt.content },
                ]})
            )
            .subscribe(this.outputs.chat.subject);
    }
}

const StreamRenderer = CardStyleMixin(class extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 16px;
            color: var(--stream-renderer-text-color, black);
            max-width: 500px;
        }
    `;

    static properties = {
        inputs: { type: Object },
        outputs: { type: Object },
    };

    constructor() {
        super();
        this.inputs = {};
        this.outputs = {};
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.outputs.stream) {
            this.outputs.stream.subject.pipe(filter(e => e)).subscribe((content) => {
                content.subscribe((content) => {
                    this.renderContent(content);
                })
            });
        }
    }

    renderContent(content) {
        this.content = content ? marked(content) : '';
        this.requestUpdate();
    }

    render() {
        return html` <div class="content">${unsafeHTML(this.content)}</div> `;
    }
})

customElements.define("stream-renderer",  StreamRenderer);
export class TransformerNode extends LitPresets.classic.Node {
    static get properties() {
        return {
            data: { type: Object },
            emit: { type: Function },
            seed: { type: String },
        };
    }

    nodeStyles() {
        return ''
    }

    constructor() {
        super();
        this.test = Math.random();

        this.resizeObserver = new ResizeObserver(() => {
        // Your callback code here
        this.handleResize();
        });
        // Add initialization code here
        this.initComponent();

    const targetNode = this;
    const config = { attributes: true, attributeFilter: ["style"] };

    const callback = (mutationsList) => {
        for (const mutation of mutationsList) {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "style"
            ) {
                const newValue = targetNode.getAttribute("style");

                // Check if change is allowed or if it's an empty string
                if (this.allowStyleChange || newValue === "") {
                    return;
                }

                console.warn("Changing the style attribute is not allowed.");

                // Set flag to indicate internal change
                this.allowStyleChange = true;

                // Revert the change
                this.style = ''

                // Reset flag
                this.allowStyleChange = false;
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    }

    setAttribute(name, value) {
        if (name === "style") {
            console.warn("You cannot change the style of this element.");
            return;
        }
        super.setAttribute(name, value);
    }


    handleResize() {
      this.emit({
          type: "noderesized",
          data: { ...this.data, element: this.element },
      });
        
        if (this.onResize) {
            this.onResize();
        }
    }
    async initComponent() {
        await this.updateComplete;

        console.log("appended userInputs", this.userInputs);

        if (this.data.component) {
            this.appendChild(this.data.component);
        }
    }

  async connectedCallback() {
    super.connectedCallback();
      this.resizeObserver.observe(this);

  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver.disconnect();
  }

    static get styles() {
        return [
            LitPresets.classic.Node.styles[0],
            css`
                :host {
                    display: block;
                }
                .name-heading {
                    font-size: 2em; /* Adjust size as you like */
                    font-weight: bold;
                    margin: 0;
                }
                .node {
                    background: var(--node-color);
                    border: 2px solid #4e58bf;
                    border-radius: 10px;
                    cursor: pointer;
                    box-sizing: border-box;
                    min-width: calc(var(--node-width) * 2);
                    height: auto;
                    position: relative;
                    user-select: none;
                    line-height: initial;
                    font-family: Arial;
                }

                .node:hover {
                    background: linear-gradient(
                            rgba(255, 255, 255, 0.04),
                            rgba(255, 255, 255, 0.04)
                        ),
                        var(--node-color);
                }

                .node.selected {
                    background: var(--node-color-selected);
                    border-color: #e3c000;
                }

                .node .title {
                    color: white;
                    font-family: sans-serif;
                    font-size: 18px;
                    padding: 8px;
                }

                .flex-column {
                    display: flex;
                    flex-direction: column;
                }

                .flex-row {
                    display: flex;
                    justify-content: space-evenly;
                    min-height: 24px;
                }

                .socket-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-grow: 1;
                }

                .input-sockets {
                    margin-top: calc(
                        (var(--socket-size) / -2) - var(--socket-margin)
                    );
                }

                .output-sockets {
                    margin-bottom: calc(
                        (var(--socket-size) / -2) - var(--socket-margin)
                    );
                }
            `,
        ];
    }

    get connectableInputs() {
        return this.inputs().filter((i) => !i[1].user);
    }

    get mappedInputs() {
        return this.inputs().map(([key, entry]) => ({ label: key, ...entry }));
    }

    get mappedOutputs() {
        return this.outputs().map(([key, entry]) => ({ label: key, ...entry }));
    }

    get mappedIntermediates() {
        
        return Object.entries(this.data.intermediates || {}).map(([key, entry]) => ({ label: key, ...entry}));
    }

    get mappedInputsWithDebug() {
        return this.inputs()
            .map(([key, input]) => ({
                ...input,
                onChange: (e) =>
                    input.showSubmit ? null : input.subject.next(e.formData),
                onSubmit: (e) => input.subject.next(e.formData),
                uiSchema: setSubmitButtonOptions(input.uiSchema, { norender: !input.showSubmit, submitText: 'send' }),
                formData: input.subject.getValue() || {}
            }))
            .concat({
                label: "debug",
                icon: unsafeHTML(icon(fas.faBug).html[0]),
                html: (open) => html` <transformer-debug-card
                    is-open="${open}"
                    .inputs="${this.mappedInputs}"
                    .outputs="${this.mappedOutputs}"
                    .intermediates="${this.mappedIntermediates}"
                ></transformer-debug-card>`,
            });
    }

    render() {
        console.log("rerender TransformNode");
        return html`
            <div
                class="node ${this.data?.selected ? "selected" : ""}"
                data-testid="node"
            >
                <div class="flex-column">
                    <div class="flex-row input-sockets">
                        <!-- Inputs -->
                        ${this.mappedInputs.map(
                            (input) => html`
                                <div
                                    class="socket-column"
                                    data-testid="input-${input.label}"
                                >
                                    <ref-element
                                        class="input-socket"
                                        .data=${{
                                            type: "socket",
                                            side: "input",
                                            key: input.label,
                                            nodeId: this.data?.id,
                                            payload: input.socket,
                                        }}
                                        .emit=${this.emit}
                                        data-testid="input-socket"
                                    ></ref-element>
                                </div>
                            `
                        )}
                        <div class="socket-column" style="flex-grow: 0" >
                                    <div style="width: 50px"></div>
                        </div>
                    </div>
                    <custom-tabs
                        .inputs=${this.mappedInputsWithDebug}
                        .name=${this.data.name}
                    ></custom-tabs>

                    <slot></slot>

                    <div class="flex-row">
                        ${this.outputs().map(
                            ([key, output]) => html`<div
                                class="output-title"
                                data-testid="output-title"
                            >
                                ${output.label}
                            </div>`
                        )}
                    </div>

                    <div class="flex-row output-sockets">
                        <!-- Outputs -->
                        ${this.outputs().map(
                            ([key, output]) => html`
                                <ref-element
                                    class="output-socket"
                                    .data=${{
                                        type: "socket",
                                        side: "output",
                                        key: key,
                                        nodeId: this.data?.id,
                                        payload: output.socket,
                                    }}
                                    .emit=${this.emit}
                                    data-testid="output-socket"
                                ></ref-element>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("transformer-node-component", TransformerNode);


class OpenAITransformer extends Transformer {
    static Component = StreamRenderer;
    static inputs = [
        {
            label: "config",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    model: {
                        type: "string",
                        default: "gpt-4",
                    },
                    api_key: {
                        type: "string",
                    },
                    temperature: {
                        type: "number",
                        minimum: 0,
                        maximum: 2,
                    },
                    stream: {
                        type: "boolean",
                        default: true,
                    },
                },
                required: ["model", "api_key"],
            },
            uiSchema: {
                model: {},
                api_key: {
                    "ui:widget": "password",
                },
                temperature: {},
                stream: {},
            },
        },
        {
            label: "chat",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        role: {
                            type: "string",
                            enum: ["system", "user", "assistant"],
                        },
                        content: {
                            type: "string",
                        },
                    },
                    required: ["role", "content"],
                },
            },
        },
    ];
    static outputs = [
        {
            label: "config",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    model: {
                        type: "string",
                        default: "gpt-4",
                    },
                    temperature: {
                        type: "number",
                        minimum: 0,
                        maximum: 2,
                    },
                    stream: {
                        type: "boolean",
                        default: true,
                    },
                },
                required: ["model"],
            },
        },
        {
            label: "chat",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        role: {
                            type: "string",
                            enum: ["system", "user", "assistant"],
                        },
                        content: {
                            type: "string",
                        },
                    },
                    required: ["role", "content"],
                },
            },
        },
        {
            label: "stream",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    _rxjsObservable: {
                        type: "boolean",
                        default: true,
                    },
                },
                required: ["_rxjsObservable"],
            },
        },
    ];

    constructor(editor, area) {
        super("OpenAI", editor, area);
    }

    async transform() {
        let lastStream = null;
        combineLatest([
            this.inputs["config"].subject.pipe(filter((i) => i)),
            this.inputs["chat"].subject.pipe(filter((e) => e)),
        ])
            .pipe(
                mergeMap(async ([config, chat]) => {
                    try {
                        this.openai =
                            this.openai ||
                            new OpenAI({
                                apiKey: config.api_key,
                                dangerouslyAllowBrowser: true,
                            });
                        if (lastStream) {
                            await lastStream.controller.abort();
                        }
                        const stream = (lastStream =
                            await this.openai.chat.completions.create({
                                model: config.model,
                                messages: chat,
                                temperature: config.temperature,
                                stream: config.stream,
                            }));

                        let outputStream = new BehaviorSubject("");
                        this.outputs.stream.subject.next(outputStream);

                        let content = "";
                        for await (const part of stream) {
                            const delta = part.choices[0]?.delta?.content || "";
                            content += delta;
                            outputStream.next(content);
                        }

                        return [
                            ...(chat || []),
                            { role: "assistant", content: content },
                        ];
                    } catch (e) {}
                }),
                filter((e) => e)
            )
            .subscribe(this.outputs.chat.subject);

        this.inputs["config"].subject.subscribe(this.outputs.config.subject);
    }
}



function process() {
    console.log("NOOP PROCESS");
}
export async function createEditor(container) {
    const editor = new NodeEditor();
    const area = new AreaPlugin(container);

    const litRender = new LitPlugin();

    const contextMenu = new ContextMenuPlugin({
        items: ContextMenuPresets.classic.setup([
            ["Number", () => new NumberNode(1, process)],
            ["Add", () => new ArithmeticTransformer(editor)],
        ]),
    });
    const minimap = new MinimapPlugin();
    const reroutePlugin = new ReroutePlugin();
    const dock = new DockPlugin();
    const connection = new ConnectionPlugin();
    connection.addPreset(ConnectionPresets.classic.setup());
    window.connection = connection
    dock.addPreset(DockPresets.classic.setup({ area, size: 100, scale: 0.6 }));

    editor.use(area);
    window.area = area;

    area.use(litRender);
    area.use(contextMenu);
    area.use(minimap);
    area.use(dock);
    area.use(connection);
    dock.add(() => new OpenAITransformer(editor, area))
    dock.add(() => new PromptTransformer(editor, area))
    dock.add(() => new IndexedDBTransformer(editor, area));
    dock.add(() => new SnapshotTransformer(editor, area));
    litRender.use(reroutePlugin);

    litRender.addPreset(
        LitPresets.classic.setup({
            socketPositionWatcher: new BetterDomSocketPosition(),
            customize: {
                node() {
                    return TransformerNode;
                },
                connection() {
                    return Connection;
                },
            },
        })
    );
    litRender.addPreset(LitPresets.contextMenu.setup());
    litRender.addPreset(LitPresets.minimap.setup());
    litRender.addPreset(
        LitPresets.reroute.setup({
            contextMenu(id) {
                reroutePlugin.remove(id);
            },
            translate(id, dx, dy) {
                reroutePlugin.translate(id, dx, dy);
            },
            pointerdown(id) {
                reroutePlugin.unselect(id);
                reroutePlugin.select(id);
            },
        })
    );

    console.log(new AddNode());
    console.log(new Transformer("adfafda", editor, area));


    const dataflow = new DataflowEngine();

    editor.use(dataflow);

    const arrange = new AutoArrangePlugin();
    const setup = (props) => {
        return () => ({
            port(data) {
                const { spacing, top, bottom } = {
                    spacing: data.width / (data.ports * 2),
                };

                if (data.side === "output") {
                    return {
                        x: (data.index * 2 + 1) * spacing,
                        y: 0,
                        width: 15,
                        height: 15,
                        side: "SOUTH",
                    };
                }
                return {
                    x: (data.index * 2 + 1) * spacing,
                    y: 0,
                    width: 15,
                    height: 15,
                    side: "NORTH",
                };
            },
        });
    };

    arrange.addPreset(setup());

    area.use(arrange);

    window.arrange = arrange;
    await arrange.layout();

    AreaExtensions.zoomAt(area, editor.getNodes());

    AreaExtensions.simpleNodesOrder(area);

    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();

    AreaExtensions.selectableNodes(area, selector, { accumulating });
    RerouteExtensions.selectablePins(reroutePlugin, selector, accumulating);

    window.editor = editor;

    const snapshot = new SnapshotTransformer(editor, area)
    snapshot.inputs.snapshot.subject.next({
        nodes: [
            {
                className: "SnapshotTransformer",
                inputs: {},
                id: "287230ef2e44869e",
            },
            {
                className: "IndexedDBTransformer",
                inputs: {
                    config: {
                        history: 0,
                        storeName: "debug",
                    },
                },
                id: "8e33c318e76bbe6c",
            },
        ],
        connections: [
            {
                id: "a177ee07402b9dfe",
                source: "287230ef2e44869e",
                sourceOutput: "snapshot",
                target: "8e33c318e76bbe6c",
                targetInput: "data",
            },
            {
                id: "7ad8ac7bc8dc4a78",
                source: "8e33c318e76bbe6c",
                sourceOutput: "data",
                target: "287230ef2e44869e",
                targetInput: "snapshot",
            },
        ],
    });

    const applier = new ArrangeAppliers.TransitionApplier({
        duration: 500,
        timingFunction: (t) => t,
        async onTick() {
            await AreaExtensions.zoomAt(area, editor.getNodes());
        }
    });

    const subscription = snapshot.outputs.snapshot.subject.pipe(
        debounceTime(100),

    ).subscribe(async () => {
        console.log(
            "No activity for .5 seconds. Executing callback..."
        );
        // You can unsubscribe here if needed
        await arrange.layout({ applier, options: { "elk.direction": "DOWN" } });
    });

    const areaSubject = new BehaviorSubject();

    areaSubject.pipe(
        filter(e => e),
        debounceTime(500),
    ).subscribe(async () => {
        console.log(
            "No activity for .5 seconds. Executing callback..."
        );
        await arrange.layout({ applier, options: { "elk.direction": "DOWN" } });
    })
        
        area.addPipe(context => {
            if (context.type === 'noderesize') {
                areaSubject.next(true)
            }
            return context;
        })
    console.log("createdEditor");
    return {
        destroy: () => area.destroy(),
    };
}

window.onload = function () {
    const appRoot = document.getElementById("root");
    createEditor(appRoot);
};

function setSubmitButtonOptions(uiSchema, options) {
    const newUiSchema = uiSchema || {};
    newUiSchema["ui:submitButtonOptions"] = {
        ...newUiSchema["ui:submitButtonOptions"], // Preserve existing options if they exist
        ...options, // Merge with new options
    };
    return newUiSchema;
}
