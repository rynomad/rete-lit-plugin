// Import LitElement and html helper function
import { LitElement, html, css } from "https://esm.sh/lit@2.0.1";

// Import your Canvas and CanvasStore classes
import { Canvas } from "./canvas.js";
import { CanvasStore } from "./canvas-store.js";
import { Transformer } from "./transformer.js";
import "./nodes/composite.js";

class CanvasLitElement extends LitElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                height: 100vh;
            }
            .wrapper {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease-in-out;
                z-index: 0;
            }
            .wrapper.active {
                opacity: 1;
                pointer-events: all;
                z-index: 1;
            }
            .content {
                position: relative;
                width: 100%;
                height: 100%;
            }
            .sidebar {
                background-color: #f4f4f4;
                overflow: auto;
                z-index: 2;
            }
            .pill {
                display: block;
                padding: 10px;
                border: 1px solid #ccc;
                margin: 5px;
                cursor: pointer;
                background-color: #fff;
            }
            .draggable-pill {
                display: flex;
                align-items: center;
            }
            .draggable-pill.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .pill-drag-handle {
                cursor: grab;
                margin-right: 5px;
            }
            .plus-button {
                display: block;
                width: 30px;
                height: 30px;
                background-color: blue;
                color: white;
                text-align: center;
                line-height: 30px;
                margin: 5px auto;
                cursor: pointer;
            }
        `;
    }

    static get properties() {
        return {
            canvasList: { type: Array },
            activeCanvas: { type: Object },
        };
    }

    constructor() {
        super();
        this.canvasList = [];
        this.activeCanvas = null;
        this.canvasCache = {};
        window.ide = this;
    }

    async connectedCallback() {
        super.connectedCallback();
        this.canvasList = (await CanvasStore.getAllMetadata()).reverse();

        // Construct all canvases without activating them
        for (const canvasMetadata of this.canvasList) {
            await this.attachCanvas(canvasMetadata, false);
        }

        // Activate the first one if available
        if (this.canvasList.length > 0) {
            await this.attachCanvas(this.canvasList[0], true);
        }
    }

    async attachCanvas(canvasMetadata, activate = true) {
        // Deactivate the current active canvas wrapper if exists
        if (this.activeCanvas) {
            const currentData = this.canvasCache[this.activeCanvas.canvasId];
            currentData.wrapper.classList.remove("active");
        }

        // Create new canvas, wrapper, and container if not in cache
        if (!this.canvasCache[canvasMetadata.canvasId]) {
            const newWrapper = document.createElement("div");
            newWrapper.classList.add("wrapper");

            const newContainer = document.createElement("div");
            newContainer.classList.add("content");

            const newCanvas = new Canvas(this, canvasMetadata);
            await newCanvas.attach(newContainer);
            newCanvas.area.container.addEventListener(
                "dragover",
                this.dragover.bind(this)
            );
            newCanvas.area.container.addEventListener(
                "drop",
                this.drop.bind(this)
            );

            newWrapper.appendChild(newContainer);

            this.canvasCache[canvasMetadata.canvasId] = {
                wrapper: newWrapper,
                container: newContainer,
                canvas: newCanvas,
            };
            this.shadowRoot.appendChild(newWrapper);
        }

        // Activate the new canvas
        if (activate) {
            const newActiveData = this.canvasCache[canvasMetadata.canvasId];
            newActiveData.wrapper.classList.add("active");
            this.activeCanvas = newActiveData.canvas;
        }
    }

    async updateCanvasName(canvasId, newName) {
        const canvas = new Canvas(this, { canvasId });
        await canvas.store.setMetadata({ canvasId, name: newName });
        this.canvasList = await CanvasStore.getAllMetadata(); // refresh list
    }

    async addNewCanvas() {
        const newCanvas = new Canvas(this); // New canvas with default id and name
        await this.attachCanvas(newCanvas); // Attach new canvas
        await newCanvas.store.setMetadata(newCanvas); // Set name
        this.canvasList = await CanvasStore.getAllMetadata(); // Refresh list
    }

    snapshots(canvasId) {
        const canvas = new Canvas(this, { canvasId });
        return canvas.snapshots;
    }

    dragStart(e, className, props) {
        if (e.target.classList.contains("disabled")) return;
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ className, props })
        );
    }

    async drop(event) {
        const { className, props } = JSON.parse(
            event.dataTransfer.getData("text/plain")
        );

        const Constructor = Transformer.childClasses.get(className);
        const node = new Constructor(this, this.activeCanvas.canvasId, props);

        await this.activeCanvas.editor.addNode(node);

        this.activeCanvas.area.area.setPointerFrom(event);

        const position = this.activeCanvas.area.area.pointer;
        const view = this.activeCanvas.nodeViews.get(node.id);

        if (!view) throw new Error("view");

        await view.translate(position.x, position.y);
    }

    dragover(e) {
        e.preventDefault();
    }

    getCanvasById(id) {
        return this.canvasCache[id] ? this.canvasCache[id].canvas : null;
    }

    onPointerEnterSidebar() {
        // get all the canvas objects from the canvas cache
        const canvasObjects = Object.values(this.canvasCache);
        if (!this.activeCanvas) return;

        // get the current value of the .snapshot behaviorSubject for all canvases via getValue
        const snapshots = canvasObjects.map((canvasObject) => ({
            canvasId: canvasObject.canvas.canvasId,
            snapshot: canvasObject.canvas.snapshots.getValue(),
        }));

        // each snapshot has an array of nodes, some of which are "CompositeTransformer" nodes, which have a ".props.canvasId"
        // we want to use this to create a dependency graph of canvases
        const dependencyGraph = snapshots.reduce((acc, _snapshot) => {
            const { canvasId, snapshot } = _snapshot;
            const compositeNodes =
                snapshot?.nodes?.filter(
                    (node) => node.className === "CompositeTransformer"
                ) || [];

            const dependencies = compositeNodes.map(
                (node) => node.props.canvasId
            );

            acc[canvasId] = dependencies;

            return acc;
        }, {});

        // we want to find a list of all canvases that are dependent on the current canvas. it needs to traverse the dependency graph
        // and find all the canvases that are dependent on the current canvas, and all the canvases that are dependent on those canvases, etc.
        const dependentCanvasIds = this.findDependentCanvasIds(
            this.activeCanvas?.canvasId,
            dependencyGraph
        );

        // now we want to find all the canvases that are not in the list of dependent canvases
        const independentCanvasIds = this.canvasList
            .map((canvas) => canvas.canvasId)
            .filter((canvasId) => !dependentCanvasIds.includes(canvasId));

        // now we want to disable drag and drop for all the canvases that are in the list of dependent canvases
        dependentCanvasIds.forEach((canvasId) => {
            const canvas = this.getCanvasById(canvasId);
            // add disabled to the draggable-pill in our sidebar

            this.shadowRoot
                .querySelector(`#${canvasId}`)
                .setAttribute("draggable", false);
        });

        // and enable drag and drop for all the canvases that are not in the list of dependent canvases
        independentCanvasIds.forEach((canvasId) => {
            const canvas = this.getCanvasById(canvasId);
            // remove disabled from the draggable-pill in our sidebar
            this.shadowRoot
                .querySelector(`#${canvasId}`)
                .setAttribute("draggable", true);
        });
    }

    findDependentCanvasIds(canvasId, dependencyGraph) {
        const dependentCanvasIds = [];

        const traverse = (canvasId) => {
            // get the dependencies of the current canvas
            const dependencies = dependencyGraph[canvasId];

            // if there are no dependencies, return
            if (!dependencies) return;

            // otherwise, add the dependencies to the list of dependent canvases
            dependentCanvasIds.push(...dependencies);

            // and for each dependency, traverse it
            dependencies.forEach(traverse);
        };

        traverse(canvasId);

        return dependentCanvasIds;
    }

    render() {
        return html`
            <div class="sidebar" @pointerenter="${this.onPointerEnterSidebar}">
                <div class="plus-button" @click="${this.addNewCanvas}">+</div>
                ${this.canvasList.map(
                    (canvas) => html`
                        <div
                            id="${canvas.canvasId}"
                            class="draggable-pill"
                            draggable="true"
                            @dragstart="${(e) =>
                                this.dragStart(
                                    e,
                                    "CompositeTransformer",
                                    canvas
                                )}"
                            @click="${() =>
                                this.attachCanvas(new Canvas(this, canvas))}">
                            <input
                                class="pill"
                                value="${canvas.name}"
                                @change="${(e) =>
                                    this.updateCanvasName(
                                        canvas.canvasId,
                                        e.target.value
                                    )}" />

                            <div class="pill-drag-handle">::</div>
                        </div>
                    `
                )}
                ${Array.from(Transformer.childClasses.keys())
                    .filter((name) => name !== "CompositeTransformer")
                    .map(
                        (name) => html` <div
                            class="draggable-pill"
                            draggable="true"
                            @dragstart="${(e) => this.dragStart(e, name)}">
                            <input class="pill" disabled value="${name}" />

                            <div class="pill-drag-handle">::</div>
                        </div>`
                    )}
            </div>
        `;
    }
}

// Define the new element
customElements.define("bespeak-ide", CanvasLitElement);
