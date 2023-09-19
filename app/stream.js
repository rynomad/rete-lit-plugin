import {
    Subject,
    ReplaySubject,
    withLatestFrom,
    filter,
    distinctUntilChanged,
    concatMap,
    catchError,
    takeUntil,
    mergeMap,
    BehaviorSubject,
    tap,
} from "https://esm.sh/rxjs";
import Ajv from "https://esm.sh/ajv@8.6.3";
import { openDB } from "https://esm.sh/idb@6.0.0";
import { deepEqual } from "https://esm.sh/fast-equals";
import { addDefaultValuesToSchema } from "./util.js";

export class Stream {
    static db = "bespeak-streams";
    static dbOpenQueue = Promise.resolve();

    constructor(node, definition) {
        const uiSchema = definition.uiSchema || {};
        delete definition.uiSchema;
        Object.assign(this, definition);
        this.node = node;
        this.id = ["meta", "transform"].some((type) => type === definition.type)
            ? `${this.node.id}-${definition.type}`
            : `${this.node.id}-${definition.name
                  .toLowerCase()
                  .replace(/ /g, "-")}`;
        this.socket = node.canvas.socket;
        this.name = definition.name;
        this.description = definition.description;
        this.schema = definition.schema;
        this.type = definition.type;
        this.snapshot = definition.snapshot;
        this._uiSchema = uiSchema;
        this.firstCreation = new Subject();
        this.createIndexedDBSubject();

        if (this.type === "meta") {
            this.subject
                .pipe(takeUntil(this.node.nodeRemoved$))
                .subscribe((value) => {
                    this.name = value.name;
                    this.description = value.description;
                });
        }
    }

    get read() {
        return this.subject.pipe(filter((value) => value !== undefined));
    }

    async createIndexedDBSubject() {
        this.queue = new Subject();
        this.subject = new ReplaySubject(1);
        await new Promise((resolve) => setTimeout(resolve, 0));
        this.queue
            .pipe(
                withLatestFrom(this.subject),
                distinctUntilChanged(([_, v1], [__, v2]) => deepEqual(v1, v2)),
                filter(([queue, value]) => !queue),
                tap(() => this.queue.next(true)),
                mergeMap(async ([_queue, value]) => {
                    await this.saveToDB(value);
                    return value;
                }),
                tap(() => this.queue.next(false)),
                catchError((error) => {
                    this.node.streamErrors$.next({ stream: this, error });
                    throw error;
                }),
                takeUntil(this.node.nodeRemoved$)
            )
            .subscribe();

        this.subject
            .pipe(
                withLatestFrom(this.queue),
                filter(([_, queue]) => !queue),
                takeUntil(this.node.nodeRemoved$)
            )
            .subscribe((value) => {
                console.log("value", value);
                this.queue.next(false);
            });

        // if (!["meta", "transform"].includes(this.type)) {
        //     return;
        // }

        const db = await this.getDB();
        const initialValue = await this.getInitialValue(db);

        if (initialValue) {
            try {
                initialValue.fromStore = true;
            } catch (error) {
                this.node.streamErrors$.next({ stream: this, error });
            }
            this.subject.next(initialValue);
        } else {
            this.subject.next(this.getDefaultValue());
        }

        await db.close();
    }

    getDefaultValue() {
        const { schema } = this;

        // Otherwise, generate default object based on schema
        if (schema) {
            const ajv = new Ajv({ strict: false, useDefaults: true });
            const augmentedSchema = addDefaultValuesToSchema(schema);
            const validate = ajv.compile(augmentedSchema);

            // Create an object that will be populated with default values
            const defaultData = {};

            // Apply default values to the object based on schema
            validate(defaultData);

            return defaultData;
        }

        throw new Error("No schema provided.");
    }

    async getDB() {
        let db;

        // Open the database without specifying a version to get the current version
        db = await openDB(Stream.db + "-" + this.type);
        let dbVersion = db.version;

        if (!db.objectStoreNames.contains(this.id)) {
            await db.close();
            dbVersion++;

            // Add the operation to the queue
            Stream.dbOpenQueue = Stream.dbOpenQueue.then(async () => {
                db = await openDB(Stream.db + "-" + this.type, dbVersion, {
                    upgrade: (db) => {
                        if (!db.objectStoreNames.contains(this.id)) {
                            db.createObjectStore(this.id, {
                                autoIncrement: true,
                            });
                        }
                    },
                });
                return db;
            });

            // Wait for the queue to finish before returning the db
            db = await Stream.dbOpenQueue;
        }

        return db;
    }

    async getInitialValue(db) {
        const tx = db.transaction(this.id, "readonly");
        const store = tx.objectStore(this.id);
        const result = await store.get("value");

        if (!result || JSON.stringify(result) === "{}") {
            this.firstCreation.next(true);
        }

        this.queue.next(false);

        return result ? result : null;
    }

    async saveToDB(value) {
        try {
            const db = await this.getDB();
            const tx = db.transaction(this.id, "readwrite");
            const store = tx.objectStore(this.id);
            await store.put(value, "value");

            await tx.done;
            await db.close();

            return tx.done;
        } catch (error) {
            this.node.streamErrors$.next({ stream: this, error });
            // Handle or rethrow error
        }
    }

    toPromptString() {
        // return markdown of the stream
        // include: name, description, schema (in code block), id, node.id
        return `## ${this.name}\n\n${this.description}\n\n\n\nStream id: ${
            this.id
        }\n\nNode id:${this.node.id}\`\`\`json\n${JSON.stringify(
            this.schema,
            null,
            4
        )}\n\`\`\``;
    }
}
