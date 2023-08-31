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

import {
    LitPlugin,
    Presets as LitPresets,
} from "../dist/rete-litv-plugin.esm.local.js";
import "./form.js";

const socket = new Classic.Socket("socket");

export class TransformerInput extends Classic.Input {
    constructor(inputConfig) {
        super(
            inputConfig.socket,
            inputConfig.hash || inputConfig.label,
            inputConfig.multipleConnections
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

    render() {
        return html`
            <main class="selectionlayout">
                <tab-header
                    .inputs=${this.inputs}
                    .openPages=${this.openPages}
                    .handleToggle=${this.handleToggle.bind(this)}></tab-header>

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
                            style="${entry.style}"></rjsf-component>
                    `;
                })}
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

        if (this.onResize) {
            this.onResize();
        }
    }
    async initComponent() {
        await this.updateComplete;

        console.log("appended userInputs", this.userInputs);

        if (this.data.component) {
            this.appendChild(this.data.component);
            this.data.setNode(this);
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
        return Object.entries(this.data.intermediates || {}).map(
            ([key, entry]) => ({ label: key, ...entry })
        );
    }

    get mappedInputsWithDebug() {
        return this.inputs()
            .map(([key, input]) => ({
                ...input,
                onChange: (e) =>
                    input.showSubmit ? null : input.subject.next(e.formData),
                onSubmit: (e) => input.subject.next(e.formData),
                uiSchema: setSubmitButtonOptions(input.uiSchema, {
                    norender: !input.showSubmit,
                    submitText: "send",
                }),
                formData: input.subject.getValue() || {},
            }))
            .concat({
                label: "debug",
                icon: unsafeHTML(icon(fas.faBug).html[0]),
                html: (open) => html` <transformer-debug-card
                    is-open="${open}"
                    .inputs="${this.mappedInputs}"
                    .outputs="${this.mappedOutputs}"
                    .intermediates="${this
                        .mappedIntermediates}"></transformer-debug-card>`,
            });
    }

    render() {
        console.log("rerender TransformNode");
        return html`
            <div
                class="node ${this.data?.selected ? "selected" : ""}"
                data-testid="node">
                <div class="flex-column">
                    <div class="flex-row input-sockets">
                        <!-- Inputs -->
                        ${this.mappedInputs.map(
                            (input) => html`
                                <div
                                    class="socket-column"
                                    data-testid="input-${input.hash ||
                                    input.label}">
                                    <ref-element
                                        class="input-socket"
                                        .data=${{
                                            type: "socket",
                                            side: "input",
                                            key: input.hash || input.label,
                                            nodeId: this.data?.id,
                                            payload: input.socket,
                                        }}
                                        .emit=${this.emit}
                                        data-testid="input-socket"></ref-element>
                                </div>
                            `
                        )}
                        <div class="socket-column" style="flex-grow: 0">
                            <div style="width: 50px"></div>
                        </div>
                    </div>
                    <custom-tabs
                        .inputs=${this.mappedInputsWithDebug}
                        .name=${this.data.name}></custom-tabs>

                    <slot></slot>

                    <div class="flex-row">
                        ${this.outputs().map(
                            ([key, output]) => html`<div
                                class="output-title"
                                data-testid="output-title">
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
    static socket = socket;
    static inputs = [];
    static outputs = [];
    static intermediates = [];
    static Component = DefaultComponent;
    static childClasses = new Map();
    static deserialize(ide, data) {
        // Retrieve the child class constructor based on the class name
        const ChildClass = Transformer.childClasses.get(data.className);

        if (!ChildClass) {
            throw new Error(`Unknown class: ${data.className}`);
        }

        const transformer = new ChildClass(ide, data.canvasId, data.props);
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

    get editor() {
        return this.ide.getCanvasById(this.canvasId)?.editor;
    }

    get area() {
        return this.ide.getCanvasById(this.canvasId).area;
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

    constructor(ide, canvasId, dataOrConstructor = {}) {
        const name = isClassConstructor(dataOrConstructor)
            ? dataOrConstructor.toString().match(/\w+/g)[1]
            : dataOrConstructor.name || dataOrConstructor.className;

        super(name);
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

    init() {
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
    }

    async postInit() {
        //   debugger
        if (this.constructor.Component) {
            this.component = new this.constructor.Component();
            this.component.inputs = this.inputs;
            this.component.outputs = this.outputs;
            this.component.intermediates = this.intermediates;
        }

        while (!this.editor) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        this.editor.addPipe((context) => {
            if (context.data.target === this.id) {
                if (context.type === "connectioncreated") {
                    console.log("new connection created", this.id, context);
                    try {
                        this.subscribe(context.data);
                    } catch (error) {
                        debugger; //alert(error.message);
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
            name: this.name,
            props: this.props,
            canvasId: this.canvasId,

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

    setNode(node) {
        this.node = node;
    }

    transform() {
        // To be overridden by child class
    }

    subscribe(context, node) {
        if (context.target !== this.id) return;

        const sourceNode = node || this.editor.getNode(context.source);
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

function setSubmitButtonOptions(uiSchema, options) {
    const newUiSchema = uiSchema || {};
    newUiSchema["ui:submitButtonOptions"] = {
        ...newUiSchema["ui:submitButtonOptions"], // Preserve existing options if they exist
        ...options, // Merge with new options
    };
    return newUiSchema;
}
