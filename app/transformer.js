import { fas } from "https://esm.sh/@fortawesome/free-solid-svg-icons";
import { icon } from "https://esm.sh/@fortawesome/fontawesome-svg-core";
import { LitElement, css, html } from "https://esm.sh/lit";
import { unsafeHTML } from "https://esm.sh/lit/directives/unsafe-html";
import { ClassicPreset as Classic } from "https://esm.sh/rete";
import "https://esm.sh/@dile/dile-pages/dile-pages.js";
import "https://esm.sh/@dile/dile-tabs/dile-tabs.js";

import { sanitizeAndRenderYaml } from "./util.js";
import { PropagationStopper, CardStyleMixin } from "./mixins.js";
import { SafeSubject as BehaviorSubject } from "./safe-subject.js";
import * as rxjs from "https://esm.sh/rxjs@7";
import {
    map,
    filter,
    tap,
    take,
    timeout,
    of,
    catchError,
} from "https://esm.sh/rxjs";
import Ajv from "https://esm.sh/ajv@8.6.2";
import Swal from "https://esm.sh/sweetalert2@11.1.0";
import {
    LitPlugin,
    Presets as LitPresets,
} from "../dist/rete-litv-plugin.esm.local.js";
import "./form.js";
function getUID() {
    if ("randomBytes" in crypto) {
        return crypto.randomBytes(8).toString("hex");
    }

    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const array = Array.from(bytes);
    const hexPairs = array.map((b) => b.toString(16).padStart(2, "0"));

    return hexPairs.join("");
}

export class TransformerInput extends Classic.Input {
    constructor(inputConfig) {
        super(
            inputConfig.socket,
            inputConfig.hash || inputConfig.label,
            !!inputConfig.multipleConnections
        );

        // Assign all properties from the inputConfig object to this class instance
        Object.assign(this, inputConfig);
        this.showControl = false;
    }
}

export class TransformerOutput extends Classic.Output {
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

const TransformerDebugCard = PropagationStopper(
    CardStyleMixin(
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
                    max-width: 70vw;
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
                    max-height: 70vh;
                }
                table {
                    background-color: #fafafa;
                    border: 1px solid #ccc;
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
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
                    width: 150px; /* Fixed width for "Label" column */
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
                            <td><div>${entry.label || entry.name}</div></td>
                            <td><pre>${formattedValue}</pre></td>
                        </tr>
                    `;
                });
            }

            // renderRows method same as the original component
        }
    )
);
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
                @dile-selected-changed=${this.handleToggle}>
                ${this.inputs.map(
                    (entry) => html`<dile-tab
                        class="${this.openPages.includes(entry.label)
                            ? "open"
                            : ""} ${entry.icon ? "icon" : ""}"
                        icon="label_important"
                        name="${entry.label}"
                        selected="false">
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
        .input-forms {
            display: flex;
            flex-direction: row;
        }

        .form {
            flex-grow: 1;
            width: 0px;
        }

        .form.hide {
            margin: 0px;
            padding: 0px;
        }

        .form.open {
            width: 100%;
            min-width: 400px;
        }
    `;

    static properties = {
        inputs: { type: Array },
        name: { type: String },
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

    closeAll() {
        this.openPages = [];
        this.requestUpdate();
    }

    openSelect(pages) {
        this.openPages = pages;
        this.requestUpdate();
    }

    openUnsubscribed() {
        this.openPages = this.inputs
            .filter((i) => !i.subscription && i.schema)
            .map((i) => i.label);
        this.requestUpdate();
    }

    render() {
        return html`
            <main class="selectionlayout">
                <tab-header
                    .inputs=${this.inputs.filter((i) => i.display !== false)}
                    .openPages=${this.openPages}
                    .handleToggle=${this.handleToggle.bind(this)}></tab-header>

                <div class="name-heading">${this.name}</div>
                <div class="input-forms">
                    ${this.inputs
                        .filter((entry) => entry.display !== false)
                        .map((entry) => {
                            console.log(entry);
                            const open = !!this.openPages.find(
                                (input) => input === entry.label
                            );
                            if (entry.html) {
                                return entry.html(open);
                            }
                            // console.log(entry);
                            return html`
                                <rjsf-component
                                    is-open="${open}"
                                    .props="${entry}"
                                    class="form ${open
                                        ? "open"
                                        : "hide"}"></rjsf-component>
                            `;
                        })}
                </div>
            </main>
        `;
    }
}

customElements.define("custom-tabs", CustomTabs);

customElements.define("transformer-debug-card", TransformerDebugCard);

export class TransformerNode extends LitPresets.classic.Node {
    static get properties() {
        return {
            data: { type: Object },
            emit: { type: Function },
            seed: { type: String },
        };
    }

    nodeStyles() {
        return "";
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
                    // Set flag to indicate internal change
                    this.allowStyleChange = true;

                    // Revert the change
                    this.style = "";

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

        this.data.canvas.view.queueArrange([this.data]);
        if (this.data.selected) {
            // this.data.canvas.zoom();
        }
        if (this.onResize) {
            this.onResize();
        }
    }

    async initComponent() {
        await this.updateComplete;

        console.log("appended userInputs", this.userInputs);
        this.data.editorNode = this;

        if (this.data.component) {
            this.appendChild(this.data.component);
        }
    }

    async connectedCallback() {
        super.connectedCallback();
        this.resizeObserver.observe(this);
        this.add;
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
        return Object.entries(this.data.intermediates || {}).map(
            ([key, entry]) => ({ label: key, ...entry })
        );
    }

    get mappedInputsWithDebug() {
        return this.inputs().map(([key, input]) => ({
            ...input,
            onChange: (e) =>
                input.showSubmit ? null : input.subject.next(e.formData),
            onSubmit: (e) => {
                input.subject.next(e.formData);
                setTimeout(() => this.data.requestSnapshot(), 100);
            },
            uiSchema: setSubmitButtonOptions(input.uiSchema, {
                norender: !input.showSubmit,
                submitText: "send",
            }),
            formData: input.subject.getValue() || {},
        }));
    }

    addFrozenProperty(schema) {
        // Base case: if the schema is not an object, return
        if (!(schema && typeof schema === "object" && schema.properties)) {
            return schema;
        }
        // Add the 'frozen' property if it does not already exist
        if (!("frozen" in schema.properties)) {
            schema.properties.frozen = { type: "boolean", default: false };
        }
        return schema;
    }

    render() {
        // console.log("rerender TransformNode");
        return html`
            <div
                class="node ${this.data?.selected ? "selected" : ""}"
                data-testid="node">
                <div class="flex-column">
                    <div class="flex-row input-sockets">
                        <!-- Inputs -->
                        ${this.mappedInputs
                            .filter((entry) => entry.display !== false)
                            .map(
                                (input) => html`
                                    <div
                                        class="socket-column"
                                        data-testid="input-${input.key}">
                                        <ref-element
                                            class="input-socket"
                                            .data=${{
                                                type: "socket",
                                                side: "input",
                                                key: input.key,
                                                nodeId: this.data?.id,
                                                payload: input.socket,
                                            }}
                                            .emit=${this.emit}
                                            data-testid="input-socket"></ref-element>
                                    </div>
                                `
                            )}
                    </div>

                    <slot></slot>

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
                                    data-testid="output-socket"></ref-element>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define("transformer-node-component", TransformerNode);

class DefaultComponent extends LitElement {
    constructor() {
        super();
    }
    render() {
        return html``;
    }
}

customElements.define("transformer-default-component", DefaultComponent);

function isClassConstructor(variable) {
    if (typeof variable !== "function") return false;

    // Check if it's an ES6 class constructor
    const isES6Class = /^class\s/.test(variable.toString());

    if (isES6Class) return true;

    // Check for older, ES5-style constructors using prototype
    if (
        variable.prototype &&
        variable.prototype.constructor === variable &&
        Object.getOwnPropertyNames(variable.prototype).includes("constructor")
    ) {
        return true;
    }

    return false;
}
export class Transformer extends Classic.Node {
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

        super(name);
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

    hasInputConnection(label) {
        return this.editor.connections.some(
            (c) => c.targetInput === this.socketKey(label)
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

            if (ioConfig.global) {
                const className = this.constructor.toString().match(/\w+/g)[1];
                let globalSubject = this.constructor.globals.get(
                    `${className}-${ioConfig.label}`
                );
                if (!globalSubject) {
                    const ajv = new Ajv();
                    globalSubject = new BehaviorSubject();
                    globalSubject
                        .pipe(
                            filter((data) => data),
                            filter((data) =>
                                ajv.validate(ioInstance.schema, data)
                            ), // Validate against the schema
                            timeout(5000), // Set a timeout of 5 seconds
                            catchError(() => {
                                // Create your custom LitElement for the form
                                def.onChange = (e) => {};
                                def.onSubmit = (e) => {
                                    console.log("onSubmit", e);
                                    ioInstance.subject.next(e.formData);
                                    this.requestSnapshot();
                                };
                                const rjsfComponent =
                                    document.createElement("rjsf-component");
                                rjsfComponent.setAttribute("is-open", "true");
                                rjsfComponent.props = def;

                                ioInstance.subject
                                    .pipe(
                                        filter((data) =>
                                            ajv.validate(
                                                ioInstance.schema,
                                                data
                                            )
                                        ), // Validate against the schema
                                        take(1)
                                    )
                                    .subscribe(() => {
                                        // Close the SweetAlert2 popup
                                        Swal.close();
                                    });

                                // Show a non-cancelable SweetAlert2 popup
                                const swalOptions = {
                                    title: "Required Configuration",
                                    html: rjsfComponent,
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    showConfirmButton: false,
                                    showCloseButton: false,
                                    customClass: {
                                        popup: "custom-popup-class",
                                    },
                                };
                                Swal.fire(swalOptions);

                                // Return an empty observable to complete the pipeline
                                return of();
                            }),
                            take(1)
                        )
                        .subscribe((validData) => {
                            // Do something with the valid data
                        });
                }
                ioInstance.subject.subscribe(globalSubject);
                globalSubject.subscribe(ioInstance.subject);
                this.constructor.globals.set(
                    `${className}-${ioConfig.label}`,
                    globalSubject
                );

                ioInstance.display = false;
            }

            addMethod(ioInstance);
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

function setSubmitButtonOptions(uiSchema, options) {
    const newUiSchema = uiSchema || {};
    newUiSchema["ui:submitButtonOptions"] = {
        ...newUiSchema["ui:submitButtonOptions"], // Preserve existing options if they exist
        ...options, // Merge with new options
    };
    return newUiSchema;
}
