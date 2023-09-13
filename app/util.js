import safeStringify from "https://esm.sh/json-stringify-safe";
import * as yaml from "https://esm.sh/js-yaml";
import {
    Observable,
    timer,
    debounce,
    map,
    tap,
    timeInterval,
    bufferCount,
    switchMap,
} from "https://esm.sh/rxjs@7.3.0";

export const sanitizeAndRenderYaml = (object) => {
    const sanitizedObject = safeStringify(object);
    if (!sanitizedObject) return;
    const parsedObject = JSON.parse(sanitizedObject);
    return yaml.dump(parsedObject);
};

export const adaptiveDebounce = (minTime, maxTime, increment) => {
    return (source) => {
        let debounceTimeMs = minTime;
        let lastEmit = Date.now();

        return new Observable((observer) => {
            return source
                .pipe(
                    tap((value) => {
                        const now = Date.now();
                        const diff = now - lastEmit;
                        lastEmit = now;

                        if (diff < minTime) {
                            debounceTimeMs = Math.min(
                                maxTime,
                                debounceTimeMs + increment
                            );
                        } else {
                            debounceTimeMs = minTime;
                        }
                        // console.log(
                        //     `Adaptive debounce time set to: ${debounceTimeMs} ms`
                        // );
                    }),
                    debounce(() => {
                        // console.log(
                        //     `Debounce triggered with duration: ${debounceTimeMs} ms`
                        // );
                        return timer(debounceTimeMs);
                    }),
                    tap(() => {
                        lastEmit = Date.now(); // Reset last emit time after debounce
                    })
                )
                .subscribe(observer);
        });
    };
};

const switchMapToLatest = (asyncTask) => (source) => {
    let pending = false;
    let latestValue = null;
    let hasLatestValue = false;

    return new Observable((observer) => {
        const subject = new Subject();
        subject
            .pipe(
                switchMap((val) =>
                    of(val).pipe(
                        tap(() => {
                            pending = true;
                        }),
                        switchMap(asyncTask),
                        tap(() => {
                            pending = false;
                        })
                    )
                )
            )
            .subscribe(observer);

        return source.subscribe({
            next(value) {
                if (!pending) {
                    subject.next(value);
                } else {
                    latestValue = value;
                    hasLatestValue = true;
                }
            },
            complete() {
                if (hasLatestValue) {
                    subject.next(latestValue);
                }
                observer.complete();
            },
            error(err) {
                observer.error(err);
            },
        });
    });
};
