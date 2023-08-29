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
import "https://esm.sh/@dile/dile-pages/dile-pages.js";
import "https://esm.sh/@dile/dile-tabs/dile-tabs.js";
import { Transformer, TransformerNode } from "./transformer.js";
import { OpenAITransformer, PromptTransformer } from "./nodes/openai.js";
import { BetterDomSocketPosition } from "./socket-position.js";
import { Connection } from "./connection.js";
import { CanvasStore } from "./canvas-store.js";
import { CanvasView } from "./canvas-view.js";

export class Canvas {
    constructor({ id, name } = {}) {
        this.id = id || this.generateGUID();
        this.name = name || "New Canvas";
        this.container = null;
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
        const editor = (this.editor = new NodeEditor());
        const area = (this.area = new AreaPlugin(container));
        this.store = new CanvasStore(this);

        const litRender = new LitPlugin();

        const contextMenu = new ContextMenuPlugin({
            items: ContextMenuPresets.classic.setup([
                ["OpenAI", () => new OpenAITransformer(editor, area)],
                ["Prompt", () => new PromptTransformer(editor, area)],
            ]),
        });
        const minimap = new MinimapPlugin();
        const reroutePlugin = new ReroutePlugin();
        const dock = new DockPlugin();
        const connection = new ConnectionPlugin();
        connection.addPreset(ConnectionPresets.classic.setup());
        dock.addPreset(
            DockPresets.classic.setup({ area, size: 100, scale: 0.6 })
        );

        editor.use(area);

        area.use(litRender);
        area.use(contextMenu);
        area.use(minimap);
        area.use(dock);
        area.use(connection);
        dock.add(() => new OpenAITransformer(editor, area));
        dock.add(() => new PromptTransformer(editor, area));
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
    }

    async initialize() {
        this.createEditor(this.container);
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
        }));
        this.area.use(this.arrange);
        this.applier = new ArrangeAppliers.TransitionApplier({
            duration: 500,
            timingFunction: (t) => t,
            async onTick() {
                await AreaExtensions.zoomAt(area, editor.getNodes());
            },
        });
    }

    async layoutArrange() {
        this.arrange.layout({
            applier: this.applier,
            options: { "elk.direction": "DOWN" },
        }); // Include your existing code for arranging layout here.
        AreaExtensions.zoomAt(area, editor.getNodes());
    }

    attach(container) {
        this.container = container;
        this.initialize();
    }

    destroy() {
        this.area.destroy();
    }
}
