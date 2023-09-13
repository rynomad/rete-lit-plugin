import { Transformer } from "../transformer.js";
import { uuid4 } from "https://esm.sh/uuid4";

import { LitElement, html, css } from "https://esm.sh/lit@2.0.2";
import Ajv from "https://esm.sh/ajv@8.6.3";
import "../meta.js";
import {
    BehaviorSubject,
    combineLatest,
    Subject,
    map,
    filter,
    scan,
    startWith,
    switchMap,
    takeUntil,
    tap,
    of,
    take,
    catchError,
    throwError,
    merge,
    skip,
    debounceTime,
} from "https://esm.sh/rxjs@7.3.0";
import { adaptiveDebounce } from "../util.js";
import OpenAI from "https://esm.sh/openai";
import Swal from "https://esm.sh/sweetalert2";
import { openDB } from "https://esm.sh/idb@6.0.0";
// Make sure to import your `ExtendedNode` class and `node-meta-component`
// import { ExtendedNode } from './ExtendedNode';
// customElements.define('node-meta-component', NodeMetaComponent);

class MagicElement extends LitElement {
    static get properties() {
        return {
            node: { type: Object },
        };
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        // Create a subject specifically for meta
        this.metaSubject = new BehaviorSubject(null);

        // Extract meta subject from the node's upstream
        this.node.upstream
            .pipe(
                map((streamArray) =>
                    streamArray.find(
                        (entry) =>
                            entry.name === "meta" && entry.node === this.node
                    )
                ),
                filter((meta) => meta !== undefined),
                map((meta) => meta.subject)
            )
            .subscribe((subject) => {
                this.metaSubject = subject;
                this.requestUpdate();
            });
    }

    static styles = css`
        :host {
            display: block;
        }
    `;

    render() {
        return html`
            <node-meta-component
                .subject=${this.metaSubject}></node-meta-component>
        `;
    }
}

customElements.define("magic-element", MagicElement);

class Stream {
    static db = "bespeak-streams";

    constructor(node, definition) {
        Object.assign(this, definition);
        this.node = node;
        this.id = ["meta", "transform"].some((type) => type === definition.type)
            ? `${this.node.id}-${definition.type}`
            : uuid4();
        this.socket = node.canvas.socket;
        this.name = definition.name;
        this.description = definition.description;
        this.schema = definition.schema;
        this.type = definition.type;
        this.snapshot = definition.snapshot;

        this.createIndexedDBSubject();
    }

    async createIndexedDBSubject() {
        this.subject = new BehaviorSubject(this.getDefaultValue());

        if (!["meta", "transform"].includes(this.type)) {
            return;
        }

        const db = await this.getDB();
        const initialValue = await this.getInitialValue(db);

        if (initialValue) {
            this.subject.next(initialValue);
        }

        this.subject
            .pipe(
                skip(1),
                debounceTime(5000),
                tap((value) => this.saveToDB(value)),
                takeUntil(this.node.nodeRemoved$)
            )
            .subscribe((value) => {
                console.log("saved to db", this.id, value);
            });
    }

    getDefaultValue() {
        const { schema } = this;

        // Otherwise, generate default object based on schema
        if (schema) {
            const ajv = new Ajv({ useDefaults: true });
            const validate = ajv.compile(schema);

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
        db = await openDB(Stream.db);
        let dbVersion = db.version;

        if (!db.objectStoreNames.contains(this.id)) {
            db.close();
            dbVersion++;
            db = await openDB(Stream.db, dbVersion, {
                upgrade: (db) => {
                    db.createObjectStore(this.id, {
                        autoIncrement: true,
                    });
                },
            });
        }
        return db;
    }

    async getInitialValue(db) {
        const tx = db.transaction(this.id, "readonly");
        const store = tx.objectStore(this.id);
        const result = await store.get("value");

        return result ? result : null;
    }

    async saveToDB(value) {
        const db = await this.getDB();
        const tx = db.transaction(this.id, "readwrite");
        const store = tx.objectStore(this.id);
        await store.put(value, "value");

        await tx.done;
        await db.close();

        return tx.done;
    }

    toPromptString() {
        if (this.type == "meta") {
            this.name = this.subject.getValue().name;
            this.description = this.subject.getValue().description;
        }
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

function getUID() {
    return Math.random().toString(36).substring(2);
}

const MAGIC_PROMPT = `## Instructions for AI Chatbot

You are an expert JavaScript Developer specializing in Functional Reactive Programming using RxJS.

### Function Signature
- Your task is to write a pure JavaScript function snippet. The function should accept an array of input streams (\`inputs\`), a \`stopObservable\`, and an \`errorObservable\`.
- The function must return an array of output streams.

### Stream Schema
\`\`\`
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "A unique identifier for the stream",
      "unique": true
    },
    "name": {
      "type": "string",
      "description": "A human-readable name for the stream"
    },
    "description": {
      "type": "string",
      "description": "A human-readable description of the stream"
    },
    "schema": {
      "type": "object",
      "description": "A JSON schema describing the data in the stream"
    },
    "type": {
      "type": "string",
      "description": "A string describing the type of stream"
    },
    "subject": {
      "type": "string",
      "description": "An RxJS Subject that emits values for the stream",
      "notes": "This is a reference to a BehaviorSubject instance, not directly serializable to JSON"
    }
  },
  "required": ["id", "name", "schema", "type", "subject"]
}
\`\`\`

### Input Streams
- The next system message will describe a node in the system, specifying the input streams and the nodes that provide them.
- You will receive IDs for these input streams. Use these IDs to find the corresponding streams in the \`inputs\` array.

### Output Streams
- Utilize \`this.createStream(definition)\` to create new output streams.
- Construct all output stream definitions inline.
- Your function must include a \`return\` statement that returns an array of output streams.

### Stream Definition Schema
The schema for stream definitions is as follows:

\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the stream."
    },
    "description": {
      "type": "string",
      "description": "A description of the stream."
    },
    "type": {
    "type": "string",
    "description": "Optional. The type of stream. 'meta' and 'transform' streams are reserved for system use. All other types are available for your use."
    },
    "schema": {
      "type": "object",
      "description": "The JSON schema that describes the data to be emitted by the subject."
    },
  },
  "required": ["id", "name", "description", "schema", "subject"]
}
\`\`\`

- Do not include the \`id\` or \`subject\` properties in your stream definition. These will be automatically generated for you.

### Code Requirements
- For imports, use inline \`async import()\` syntax from \`https://esm.sh/\`. Make sure to specify the version.
- **Important Note on RxJS**: The import paths for RxJS operators have changed. Instead of importing from \`rxjs/operators\`, you should now use: \`const { map, filter, combineLatest } = await import('https://esm.sh/rxjs')\`.
- For default exports, explicitly specify the \`default\` keyword.
- All read/write to streams should be done via the \`subject\` property of the stream object.

### Mandatory Requirements
- You MUST use the \`stopObservable\` to terminate your pipeline when it emits a signal.
- Any runtime errors that occur within your function MUST be sent to the \`errorObservable\`.
- You MUST ONLY return the function declaration. DO NOT invoke the function or return anything else.
- Ensure your code is runnable in a browser environment without requiring transpilation. That means no TypeScript, JSX, or NodeJS-specific APIs unless they can be commonly polyfilled.


### Utilities
- \`this.Swal\` is the sweetalert2 library available for displaying alerts and toasts. Default to showing toasts unless specified otherwise.
- Use \`this.cors(url)\` to wrap URLs with a CORS proxy when making HTTP requests, unless directed otherwise.

Your output should be presented in a single Markdown code block containing only the function definition.
`;

export class MagicTransformer extends Transformer {
    static Component = MagicElement;
    static inputs = [
        {
            label: "api_key",
            global: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    api_key: {
                        type: "string",
                    },
                },
                required: ["api_key"],
            },
            uiSchema: {
                api_key: {
                    "ui:widget": "password",
                },
            },
        },
        {
            label: "inputs",
            multipleConnections: "zip",
        },
    ];

    static outputs = [
        {
            label: "outputs",
        },
    ];

    meta = new Stream(this, {
        name: "meta",
        type: "meta",
        show: true,
        schema: {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            required: ["name", "description"],
            properties: {
                name: {
                    type: "string",
                    default: "New Magic Node",
                    description: "a short name for the node",
                },
                description: {
                    type: "string",
                    default: "A short description of what the node does",
                },
            },
        },
        uiSchema: {
            name: {
                "ui:widget": "text",
            },
            description: {
                "ui:widget": "textarea",
                "ui:options": {
                    rows: 10,
                },
            },
        },
    });

    magicPrompt = [
        {
            role: "system",
            content: MAGIC_PROMPT,
        },
    ];

    upstream = new BehaviorSubject([this.meta]); // Initialized with meta
    downstream = new BehaviorSubject([]);
    gpt = new BehaviorSubject(null);
    openaiApi = new BehaviorSubject(null);
    Swal = Swal;

    constructor(ide, canvasId, data = MagicTransformer, id) {
        super(ide, canvasId, data, id);
        this.corsProxyUrl = "http://localhost:8080/";
        this.setup();
        this.cors = this.cors.bind(this);
        this.nodeRemoved$ = new Subject();
    }

    chatMap(config = {}) {
        config.model ||= "gpt-4";
        config.temperature ||= 0.3;
        const mergeStrategy = config.mergeStrategy || "first";
        delete config.mergeStrategy;
        return switchMap((messages) => {
            return this.openaiApi.pipe(
                filter((openai) => !!openai),
                take(1),
                switchMap((openai) => {
                    try {
                        return openai.chat.completions
                            .create({
                                ...config,
                                messages: messages
                                    .map((message) =>
                                        !Array.isArray(message) ||
                                        mergeStrategy === "all"
                                            ? message
                                            : message[0]
                                    )
                                    .flat(),
                                mergeStrategy: undefined,
                            })
                            .then((res) => ({
                                ...res,
                                history: messages.concat([
                                    res.choices.map((choice) => choice.message),
                                ]),
                            }));
                    } catch (error) {
                        // Handle synchronous errors if any
                        return throwError(error);
                    }
                }),
                catchError((error) => {
                    // Handle API errors here
                    console.error("API call failed:", error);

                    // Replace with a new observable if you want to continue the pipeline,
                    // or re-throw the error to terminate it.
                    return throwError(error);
                    // return of(null); // to replace with a new observable that emits `null`
                })
            );
        });
    }

    cors(url, options = {}) {
        return `${this.corsProxyUrl}${url}`;
    }

    async setup() {
        await this.ready;
        const transformFunctions$ = new BehaviorSubject(() => {
            return [];
        });
        this.transformCode$ = this.createStream({
            name: "transformCode",
            type: "transform",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    code: {
                        type: "string",
                        default: "function (){return []}",
                    },
                },
            },
        });
        // Initialize nodeRemoved$ based on editorStream
        this.canvas.editorStream
            .pipe(
                filter((event) => event),
                filter((event) => event.type === "noderemoved"),
                filter((event) => event.data.id === this.id)
            )
            .subscribe(this.nodeRemoved$);

        // Setup upstream connections
        const connectionEvents$ = this.canvas.editorStream.pipe(
            filter((event) => event),
            filter((event) =>
                ["connectioncreated", "connectionremoved"].includes(event.type)
            ),
            map((event) => ({
                type: event.type,
                sourceNode: this.canvas.editor.getNode(event.data.source),
                targetNode: this.canvas.editor.getNode(event.data.target),
            })),
            filter(({ targetNode }) => targetNode.id === this.id),
            scan((connectedNodes, { type, sourceNode }) => {
                return type === "connectioncreated"
                    ? [...connectedNodes, sourceNode]
                    : connectedNodes.filter(
                          (node) => node.id !== sourceNode.id
                      );
            }, []),
            startWith([]),
            takeUntil(this.nodeRemoved$)
        );

        connectionEvents$.subscribe((e) => {
            console.log("connectionEvents$", this.id, e);
        });

        this.upstream.subscribe((e) => {
            console.log("upstream", this.id, e);
        });

        this.downstream.subscribe((e) => {
            console.log("downstream", this.id, e);
        });

        connectionEvents$
            .pipe(
                switchMap((connectedNodes) => {
                    const downstreams = connectedNodes.map(
                        (node) => node.downstream
                    );
                    return combineLatest(downstreams).pipe(
                        map((arrays) => {
                            const uniqueArray = [
                                ...new Set([].concat(...arrays)),
                            ];
                            // Always include meta object in the upstream
                            return [this.meta, ...uniqueArray];
                        })
                    );
                }),
                takeUntil(this.nodeRemoved$)
            )
            .subscribe(this.upstream);

        this.transformErrors$ = new BehaviorSubject(null);

        combineLatest([this.upstream, transformFunctions$])
            .pipe(
                switchMap(async ([streams, transform]) => {
                    // Create a new stop signal for this run
                    const currentTransformStop$ = new Subject();
                    let isError = false;
                    let transformedStreams;
                    let error;

                    try {
                        transformedStreams = await transform(
                            streams,
                            merge(this.nodeRemoved$, currentTransformStop$),
                            this.transformErrors
                        );
                        if (!Array.isArray(transformedStreams)) {
                            throw new Error(
                                "Transform function must return an array of streams"
                            );
                        }
                    } catch (e) {
                        isError = true;
                        error = e;
                    }

                    return {
                        transformedStreams,
                        originalStreams: streams,
                        isError,
                        error,
                        currentTransformStop$,
                    };
                }),
                scan(
                    (
                        acc,
                        {
                            transformedStreams,
                            originalStreams,
                            isError,
                            error,
                            currentTransformStop$,
                        }
                    ) => {
                        if (isError) {
                            transformedStreams = acc.prevTransformed;
                            console.error("An error occurred:", error);
                        } else {
                            // If a previous transform stop signal exists, trigger it
                            if (acc.lastTransformStop$) {
                                acc.lastTransformStop$.next();
                                acc.lastTransformStop$.complete();
                            }

                            // Set the current transform stop signal as the last one
                            acc.lastTransformStop$ = currentTransformStop$;
                        }

                        acc.prevTransformed = transformedStreams;

                        return {
                            prevTransformed: acc.prevTransformed,
                            transformed: transformedStreams,
                            originalStreams,
                            lastTransformStop$: acc.lastTransformStop$,
                        };
                    },
                    {
                        prevTransformed: null,
                        transformed: null,
                        originalStreams: null,
                        lastTransformStop$: null,
                    }
                ),
                tap(({ transformed, originalStreams }) => {
                    console.log("transformed", this.id, transformed);
                    console.log("originalStreams", this.id, originalStreams);
                }),
                map(({ transformed, originalStreams }) => {
                    const chainables = originalStreams.filter(
                        (stream) =>
                            stream.chainable && !transformed.includes(stream)
                    );
                    return [this.meta, ...transformed, ...chainables];
                }),
                takeUntil(this.nodeRemoved$)
            )
            .subscribe(this.downstream);

        this.getInput("api_key")
            .subject.pipe(
                filter((e) => e?.api_key),
                map(
                    ({ api_key }) =>
                        new OpenAI({
                            apiKey: api_key,
                            dangerouslyAllowBrowser: true,
                        })
                )
            )
            .subscribe(this.openaiApi);

        this.initialCode$ = this.transformCode$.subject.pipe(filter((e) => e));
        this.errorCorrectedCode$ = new Subject();

        combineLatest(
            this.upstream.pipe(
                filter(
                    (streams) =>
                        streams.length === 1 ||
                        streams.length >
                            streams.filter((stream) => stream.type === "meta")
                                .length
                )
            ),
            this.meta.subject.pipe(
                filter((e) => e && e.name !== "New Magic Node")
            )
        )
            .pipe(
                adaptiveDebounce(5000, 30000, 1000),
                map(([upstream, _meta]) => {
                    const upstreamStreams = upstream.filter(
                        (stream) => stream.id !== this.meta.id
                    );
                    const upstreamMeta = upstreamStreams.filter(
                        (stream) => stream.meta
                    );
                    const upstreamAvailable = upstreamStreams.filter(
                        (stream) => !stream.meta
                    );

                    const content = [
                        `# Node to build`,
                        this.meta.toPromptString(),
                        `# Upstream nodes`,
                        upstreamMeta.map((stream) => stream.toPromptString()),
                        `# Available streams`,
                        upstreamAvailable.map((stream) =>
                            stream.toPromptString()
                        ),
                    ]
                        .flat()
                        .join("\n");

                    const messages = [
                        ...this.magicPrompt,
                        {
                            role: "system",
                            content,
                        },
                    ];
                    return messages;
                }),
                this.chatMap(),
                map((response) => response.choices[0].message.content),
                filter((e) => e),
                map(this.parseSingleCodeBlock),
                takeUntil(this.nodeRemoved$)
            )
            .subscribe(this.initialCode$);

        this.initialCode$
            .pipe(
                map(this.createAsyncFunctionFromString.bind(this)),
                filter((e) => e),
                tap((e) => console.log("gpt", e)),
                takeUntil(this.nodeRemoved$)
            )
            .subscribe(transformFunctions$);

        this.downstream.pipe(skip(2)).subscribe(() => this.requestSnapshot());
    }

    createStream(definition) {
        return new Stream(this, definition);
    }

    parseSingleCodeBlock(markdown) {
        const regex = /```(\w+)?\s*\n([\s\S]*?)\s*```/m;
        const match = regex.exec(markdown);

        if (match) {
            return {
                language: match[1] || null,
                code: match[2],
            };
        }

        return null;
    }

    createAsyncFunctionFromString({ code }) {
        code = code.trim();
        try {
            return new Function(
                "context",
                "return (" + code + ").bind(context)"
            )(this);
        } catch (e) {
            console.error(e, code);
            return null;
        }
    }
}

Transformer.childClasses.set("MagicTransformer", MagicTransformer);
