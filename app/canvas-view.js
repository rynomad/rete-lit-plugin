import { SafeSubject } from "./safe-subject.js";
import {
    combineLatest,
    map,
    mergeMap,
    filter,
    debounceTime,
    tap,
    distinctUntilChanged,
} from "https://esm.sh/rxjs";
export class CanvasView {
    constructor(canvas) {
        this.canvas = canvas;
        this.arrangeObserver = new SafeSubject(true);

        this.arrangeObserver.pipe(debounceTime(200)).subscribe(() => {
            this.canvas.layoutArrange();
        });

        this.setupSubscriptions();
    }

    setupSubscriptions() {
        this.canvas.area.addPipe((context) => {
            if (context.type === "noderesize") {
                this.arrangeObserver.next(Math.random());
            }
            return context;
        });

        this.canvas.editor.addPipe((context) => {
            if (
                [
                    "nodecreated",
                    "noderemoved",
                    "connectioncreated",
                    "connectionremoved",
                ].includes(context.type)
            ) {
                this.arrangeObserver.next(Math.random());
            }
            return context;
        });
    }
}
