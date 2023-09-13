import { ClassicPreset as Classic, NodeEditor } from "https://esm.sh/rete";
import {
    AreaExtensions,
    AreaPlugin,
} from "https://esm.sh/rete-area-plugin@2.0.0";
import {
    LitPlugin,
    Presets as LitPresets,
} from "../dist/rete-litv-plugin.esm.local.js";
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
import "https://esm.sh/@dile/dile-pages/dile-pages.js";
import "https://esm.sh/@dile/dile-tabs/dile-tabs.js";
import { Transformer, TransformerNode } from "./transformer.js";
import { BetterDomSocketPosition } from "./socket-position.js";
import { Connection } from "./connection.js";
import { CanvasStore } from "./canvas-store.js";
import { CanvasView } from "./canvas-view.js";
import { BehaviorSubject } from "https://esm.sh/rxjs";

export class Canvas {
    constructor(ide, { canvasId, name } = {}) {
        console.log("new canvas spam");
        this.ide = ide;
        this.canvasId = canvasId || this.generateGUID();
        this.name = name || "New Canvas";
        this.store = new CanvasStore(this);
        this.snapshots = this.store.snapshots;
        this.container = null;
        this.editor = new NodeEditor();
    }
    generateGUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    async createEditor(container) {
        const editor = this.editor;
        const area = (this.area = new AreaPlugin(container));

        const litRender = new LitPlugin();

        const contextMenu = new ContextMenuPlugin({
            items: ContextMenuPresets.classic.setup([]),
        });
        const minimap = new MinimapPlugin();
        const reroutePlugin = new ReroutePlugin();
        const connection = new ConnectionPlugin();
        connection.addPreset(ConnectionPresets.classic.setup());

        editor.use(area);

        area.use(litRender);
        area.use(contextMenu);
        area.use(minimap);
        area.use(connection);
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

        this.setupArrange();

        AreaExtensions.zoomAt(area, editor.getNodes());

        AreaExtensions.simpleNodesOrder(area);

        const selector = AreaExtensions.selector();
        const accumulating = AreaExtensions.accumulateOnCtrl();

        AreaExtensions.selectableNodes(area, selector, { accumulating });
        RerouteExtensions.selectablePins(reroutePlugin, selector, accumulating);

        this.view = new CanvasView(this);

        this.editorStream = new BehaviorSubject();
        this.editor.addPipe((context) => {
            this.editorStream.next(context);
            return context;
        });
    }

    async initialize() {
        await this.createEditor(this.container);
        this.store.initEditorPipe();
    }

    setupArrange() {
        this.arrange = new AutoArrangePlugin();
        this.arrange.addPreset(() => ({
            port(data) {
                const { spacing, top, bottom } = {
                    spacing: data.width / (data.ports * 2),
                };

                if (data.side === "output") {
                    return {
                        x: data.width / 2,
                        y: 0,
                        width: 15,
                        height: 15,
                        side: "SOUTH",
                    };
                }
                return {
                    x: data.width / 2,
                    y: 0,
                    width: 15,
                    height: 15,
                    side: "NORTH",
                };
            },
        }));
        this.area.use(this.arrange);
        this.applier = new ArrangeAppliers.TransitionApplier({
            duration: 500,
            timingFunction: (t) => t,
            onTick: () => {
                // if (this.getZoomNodes().some((node) => node.selected)) {
                //     this.zoom();
                // }
            },
        });
    }

    async layoutArrange(nodes = this.editor.getNodes()) {
        // console.log("layout");
        this.zoomNodes = this.getZoomNodes(nodes);
        this.arrange.layout({
            applier: this.applier,
            options: { "elk.direction": "DOWN" },
        }); // Include your existing code for arranging layout here.
        if (!this.firstZoom) {
            this.zoom();
            this.firstZoom = true;
        }
    }

    zoom() {
        this.zoomNodes = this.getZoomNodes();
        AreaExtensions.zoomAt(this.area, this.zoomNodes);
    }

    getZoomNodes() {
        const nodes = this.editor.getNodes();
        return nodes.some((node) => node.selected)
            ? nodes.filter((node) => node.selected)
            : this.editor.getNodes();
    }

    async attach(container) {
        this.container = container;
        await this.initialize();
        AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    }

    destroy() {
        this.area.destroy();
    }
}
