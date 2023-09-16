import { SafeSubject } from "./safe-subject.js";
import {
    combineLatest,
    map,
    mergeMap,
    filter,
    debounceTime,
    tap,
    distinctUntilChanged,
    BehaviorSubject,
} from "https://esm.sh/rxjs";
import { structures } from "https://esm.sh/rete-structures";
export class CanvasView {
    constructor(canvas) {
        this.canvas = canvas;
        this.graph = structures(canvas.editor);
        this.arrangeObserver = new BehaviorSubject();

        this.arrangeObserver.subscribe((nodes) => {
            // console.log("trigger arrange", nodes);
            this.canvas.layoutArrange(nodes);
        });

        this.setupSubscriptions();
    }

    queueArrange(nodes) {
        // console.log("queueArrange", nodes);
        this.arrangeObserver.next(nodes);
    }

    setupSubscriptions() {
        this.canvas.area.addPipe((context) => {
            if (context.type === "noderesize") {
                // this.arrangeObserver.next(context);
                // console.log("noderesize", context);
            }
            return context;
        });

        this.canvas.editor.addPipe((context) => {
            if (
                [
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                ].includes(context.type)
            ) {
                this.arrangeObserver.next(this.canvas.editor.getNodes());
            }
            return context;
        });
    }
}
