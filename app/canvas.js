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
import {
    BehaviorSubject,
    first,
    scan,
    share,
    take,
    ReplaySubject,
    switchMap,
    merge,
    map,
    filter,
    withLatestFrom,
} from "https://esm.sh/rxjs";

import { structures } from "https://esm.sh/rete-structures";

import "./canvas-sidebar.js";
import "./tabs.js";

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
        this.editorStream = new ReplaySubject(1);
        this.areaStream = new ReplaySubject(1);
        this.editor.addPipe((context) => {
            this.editorStream.next(context);
            return context;
        });
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

        this.area.addPipe((context) => {
            this.areaStream.next(context);
            return context;
        });
        const litRender = new LitPlugin();

        const contextMenu = new ContextMenuPlugin({
            items: ContextMenuPresets.classic.setup([]),
        });
        // const minimap = new MinimapPlugin();
        const reroutePlugin = new ReroutePlugin();
        const connection = new ConnectionPlugin();
        connection.addPreset(ConnectionPresets.classic.setup());

        editor.use(area);

        area.use(litRender);
        area.use(contextMenu);
        // area.use(minimap);
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

        // this.view = new CanvasView(this);
    }

    async initialize() {
        await this.createEditor(this.container);
        this.initSidebar();

        this.store.initEditorPipe();
    }

    initSidebar() {
        const sidebar = document.createElement("canvas-sidebar");
        this.container.parentElement.appendChild(sidebar);

        this.areaStream
            .pipe(filter((context) => context.type === "custom-node-selected"))
            .subscribe(sidebar.subject);
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

        this.store.updates.pipe(take(1)).subscribe((nodes) => {
            nodes = this.editor.getNodes();
            AreaExtensions.zoomAt(this.area, nodes);
            const applier = new ArrangeAppliers.TransitionApplier({
                duration: 200,
                timingFunction: (t) => t,
                onTick: () => {
                    AreaExtensions.zoomAt(this.area, nodes);
                },
            });

            this.arrange.layout({
                applier,
                options: { "elk.direction": "DOWN" },
            });
        });

        merge(this.editorStream, this.areaStream)
            .pipe(
                withLatestFrom(this.store.updates),
                map(([context, updates]) => context),
                filter((context) =>
                    [
                        "noderemoved",
                        "connectioncreated",
                        "connectionremoved",
                        "custom-node-resize",
                        "custom-node-selected",
                    ].includes(context.type)
                ),
                scan((acc, value) => {
                    if (acc && acc.cancel) {
                        acc.cancel();
                    }
                    const applier = new ArrangeAppliers.TransitionApplier({
                        duration: 200,
                        timingFunction: (t) => t,
                        onTick: () => {
                            this.zoom();
                        },
                    });

                    this.arrange.layout({
                        applier,
                        options: { "elk.direction": "DOWN" },
                    });

                    return applier;
                }, null)
            )
            .subscribe();
    }

    async layoutArrange(nodes = this.editor.getNodes(), instant = true) {
        // console.log("layout");
        // this.applier = this.zoomNodes = this.getZoomNodes(nodes);
        // this.arrange.layout({
        //     applier: this.applier,
        //     options: { "elk.direction": "DOWN" },
        // }); // Include your existing code for arranging layout here.
        // this.zoom();
    }

    zoom() {
        const nodes = this.getZoomNodes();
        if (!nodes) return;
        // const scale = 0.8;
        // const nodeRects = nodes
        //     .map((node) => ({ view: this.area.nodeViews.get(node.id), node }))
        //     .filter((item) => item.view)
        //     .map(({ view, node }) => {
        //         const { width, height } = node;

        //         if (
        //             typeof width !== "undefined" &&
        //             typeof height !== "undefined"
        //         ) {
        //             return {
        //                 position: view.position,
        //                 width,
        //                 height,
        //             };
        //         }

        //         return {
        //             position: view.position,
        //             width: view.element.clientWidth,
        //             height: view.element.clientHeight,
        //         };
        //     });

        // const boundingBox = AreaExtensions.getBoundingBox(this.area, nodeRects);
        // const [w, h] = [
        //     this.container.clientWidth,
        //     this.container.clientHeight,
        // ];
        // const [kw, kh] = [w / boundingBox.width, h / boundingBox.height];
        // const k = Math.min(kh * scale, kw * scale, 1);

        // const target_x = w / 2 - boundingBox.center.x * k;
        // const target_y = h / 2 - boundingBox.center.y * k;
        // this.area.translate(k, target_x, target_y);
        // this.area.area.zoom(k, 0, 0);

        AreaExtensions.zoomAt(this.area, nodes);
    }

    getZoomNodes() {
        const graph = structures(this.editor);
        let nodes = this.editor.getNodes().filter((node) => node.selected);
        let stackHeight = 0;
        let tallestNode = 0;

        if (!nodes.length) {
            return null;
            nodes = graph.leaves().nodes() || [];
        }

        const getNodes = (direction, current) => {
            return Array.from(
                new Set(
                    current.map((node) => graph[direction](node.id).nodes())
                )
            );
        };

        if (
            nodes.some((node) => graph.outgoers(node.id).nodes().length) &&
            nodes.some((node) => graph.incomers(node.id).nodes().length)
        ) {
            const outgoers = getNodes("outgoers", nodes);
            const box = AreaExtensions.getBoundingBox(this.area, [
                ...nodes,
                ...outgoers,
            ]);
            if (
                AreaExtensions.getBoundingBox(this.area, [
                    ...nodes,
                    ...outgoers,
                ]).height > this.container.clientHeight
            ) {
                return nodes;
            }

            nodes = [...nodes, ...outgoers];

            const incomers = getNodes("incomers", nodes);
            if (
                AreaExtensions.getBoundingBox(this.area, [
                    ...nodes,
                    ...incomers,
                ]).height > this.container.clientHeight
            ) {
                return nodes;
            }

            nodes = [...nodes, ...incomers];
        } else if (
            nodes.some((node) => graph.incomers(node.id).nodes().length)
        ) {
            let incomers = getNodes("incomers", nodes);
            if (
                AreaExtensions.getBoundingBox(this.area, [
                    ...nodes,
                    ...incomers,
                ]).height > this.container.clientHeight
            ) {
                return nodes;
            }

            nodes = [...nodes, ...incomers];

            incomers = getNodes("incomers", nodes);
            if (
                AreaExtensions.getBoundingBox(this.area, [
                    ...nodes,
                    ...incomers,
                ]).height > this.container.clientHeight
            ) {
                return nodes;
            }

            nodes = [...nodes, ...incomers];
        } else if (
            nodes.some((node) => graph.outgoers(node.id).nodes().length)
        ) {
            let outgoers = getNodes("outgoers", nodes);
            if (
                AreaExtensions.getBoundingBox(this.area, [
                    ...nodes,
                    ...outgoers,
                ]).height > this.container.clientHeight
            ) {
                return nodes;
            }

            nodes = [...nodes, ...outgoers];

            outgoers = getNodes("outgoers", nodes);
            if (
                AreaExtensions.getBoundingBox(this.area, [
                    ...nodes,
                    ...outgoers,
                ]).height > this.container.clientHeight
            ) {
                return nodes;
            }

            nodes = [...nodes, ...outgoers];
        }

        return nodes.flat().flat();
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
