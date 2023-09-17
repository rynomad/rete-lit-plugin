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

export async function hashPOJO(obj) {
    // Sort object keys to ensure consistent hashing
    const sortedObj = JSON.stringify(sortObjectKeys(obj));

    // Convert JSON string to a buffer
    const msgBuffer = new TextEncoder().encode(sortedObj);

    // Hash the buffer using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

    // Convert the hash to a string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
}

function sortObjectKeys(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = sortObjectKeys(obj[key]);
            return result;
        }, {});
}

export function getUID() {
    if ("randomBytes" in crypto) {
        return crypto.randomBytes(8).toString("hex");
    }

    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const array = Array.from(bytes);
    const hexPairs = array.map((b) => b.toString(16).padStart(2, "0"));

    return hexPairs.join("");
}

export function addDefaultValuesToSchema(schema) {
    if (schema.type === "object") {
        schema.properties = schema.properties || {};
        schema.required = schema.required || [];

        schema.required.forEach((key) => {
            if (schema.properties[key].type === "object") {
                schema.properties[key].default =
                    schema.properties[key].default || {};
                addDefaultValuesToSchema(schema.properties[key]);
            } else if (schema.properties[key].type === "array") {
                schema.properties[key].default =
                    schema.properties[key].default || [];
                addDefaultValuesToSchema(schema.properties[key]);
            }
        });

        for (const key of Object.keys(schema.properties)) {
            if (
                schema.properties[key].type === "object" &&
                !schema.properties[key].default
            ) {
                addDefaultValuesToSchema(schema.properties[key]);
            }
        }
    } else if (schema.type === "array") {
        schema.default = schema.default || [];

        if (
            schema.items &&
            (schema.items.type === "object" || schema.items.type === "array")
        ) {
            addDefaultValuesToSchema(schema.items);
        }
    }

    return schema;
}
