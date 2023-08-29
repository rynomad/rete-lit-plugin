import { DOMSocketPosition } from "https://esm.sh/rete-render-utils";

export class BetterDomSocketPosition extends DOMSocketPosition {
    attach(scope) {
        if (this.area) return;
        if (!scope.hasParent()) return;
        this.area = scope.parentScope();

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
                        .filter((item) => item.nodeId === context.data.id)
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
