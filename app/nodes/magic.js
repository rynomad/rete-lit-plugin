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
    take,
    catchError,
    throwError,
    merge,
    concat,
    share,
    withLatestFrom,
    distinctUntilChanged,
    shareReplay,
    mergeMap,
    ReplaySubject,
    from,
} from "https://esm.sh/rxjs@7.3.0";
import * as rxjs from "https://esm.sh/rxjs@7.3.0";
import { adaptiveDebounce, hashPOJO } from "../util.js";
import OpenAI from "https://esm.sh/openai";
import Swal from "https://esm.sh/sweetalert2";
import { openDB } from "https://esm.sh/idb@6.0.0";
import { deepEqual } from "https://esm.sh/fast-equals";
import { PropagationStopper } from "../mixins.js";
import { Readability } from "https://esm.sh/@mozilla/readability";
import { getUID } from "../util.js";
// Make sure to import your `ExtendedNode` class and `node-meta-component`
// import { ExtendedNode } from './ExtendedNode';
// customElements.define('node-meta-component', NodeMetaComponent);
function addDefaultValuesToSchema(schema) {
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

function chatTransform(inputs, stopObservable, errorObservable) {
    let gptMessages$;

    // Find the stream object of type 'gpt-messages' in the inputs array
    for (const input of inputs) {
        if (input.type === "gpt-messages") {
            gptMessages$ = input.subject.pipe(filter((e) => e && e.length > 0));
            break;
        }
    }

    // If not found, use from([])
    if (!gptMessages$) {
        gptMessages$ = from([[]]);
    }

    const formSubject = this.createChatInput();

    // Create output with the 'chat messages' schema
    const chatMessagesSchema = {
        name: "chat messages",
        description: "gpt chat log",
        type: "gpt-messages",
        schema: {
            type: "array",
            items: {
                oneOf: [
                    {
                        type: "object",
                        properties: {
                            role: {
                                type: "string",
                                enum: ["system", "user", "assistant"],
                            },
                            content: {
                                type: "string",
                            },
                        },
                        required: ["role", "content"],
                    },
                    {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                role: {
                                    type: "string",
                                    enum: ["system", "user", "assistant"],
                                },
                                content: {
                                    type: "string",
                                },
                            },
                            required: ["role", "content"],
                        },
                    },
                ],
            },
        },
        uiSchema: {},
    };

    const output = this.createStream(chatMessagesSchema);

    // Combine the latest form subject values with the gpt-messages
    combineLatest([formSubject, gptMessages$])
        .pipe(
            filter(([value]) => value.message),
            map(([formValue, gptMessages]) => {
                return [
                    ...gptMessages,
                    {
                        role: "user",
                        content: formValue.message,
                    },
                ];
            }),
            tap(async (value) => {
                if (!this.hasConnection("outputs")) {
                    const nextNode = new MagicTransformer(
                        this.ide,
                        this.canvasId
                    );
                    const connection = {
                        id: getUID(),
                        source: this.id,
                        target: nextNode.id,
                        sourceOutput: this.getOutput("outputs").key,
                        targetInput: nextNode.getInput("inputs").key,
                    };
                    await this.editor.addNode(nextNode);
                    const view = this.canvas.area.nodeViews.get(nextNode.id);
                    const selfView = this.canvas.area.nodeViews.get(this.id);
                    const translate = {
                        y: selfView.position.y + 100 + this.height,
                        x: selfView.position.x,
                    };
                    view.translate(translate.x, translate.y);
                    await this.editor.addConnection(connection);
                }
            }),
            this.chatMap({ stream: true }),
            takeUntil(stopObservable)
        )
        .subscribe(output.subject);
    return [output];
}

class MagicElement extends PropagationStopper(LitElement) {
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

    showDebug() {
        const inputs = this.node.upstream.getValue();
        const outputs = this.node.downstream.getValue();
        const debug = document.createElement("transformer-debug-card");
        debug.inputs = inputs;
        debug.outputs = outputs;

        const swalOptions = {
            title: "Debug",
            html: debug, // Your custom DOM element
            width: "70vw",
            height: "70vh",
            textAlign: "left",
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
            customClass: {
                popup: "custom-popup-class",
            },
        };

        // Show the SweetAlert2 popup
        this.node.Swal.fire(swalOptions);
    }

    render() {
        return html`
            <node-meta-component
                .subject=${this.metaSubject}></node-meta-component>
            <slot></slot>
            <stream-renderer .stream=${this.node.chatStreams}></stream-renderer>
            <button @click=${this.showDebug}>show debug</button>
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
            : `${this.node.id}-${definition.name
                  .toLowerCase()
                  .replace(/ /g, "-")}`;
        this.socket = node.canvas.socket;
        this.name = definition.name;
        this.description = definition.description;
        this.schema = definition.schema;
        this.type = definition.type;
        this.snapshot = definition.snapshot;
        this.firstCreation = new Subject();
        this.createIndexedDBSubject();
    }

    get read() {
        return this.subject.pipe(filter((value) => value !== undefined));
    }

    async createIndexedDBSubject() {
        this.queue = new Subject();
        this.subject = new BehaviorSubject(this.getDefaultValue());
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
                // tap((value) => console.log("saved to db", value)),
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

        if (!["meta", "transform"].includes(this.type)) {
            return;
        }

        const db = await this.getDB();
        const initialValue = await this.getInitialValue(db);

        if (initialValue) {
            initialValue.fromStore = true;
            this.subject.next(initialValue);
        }
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
            db.close();
            dbVersion++;
            db = await openDB(Stream.db + "-" + this.type, dbVersion, {
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

        if (!result || JSON.stringify(result) === "{}") {
            this.firstCreation.next(true);
        }

        this.queue.next(false);

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

const MAGIC_PROMPT = `## Instructions for AI Chatbot

You are an expert JavaScript Developer specializing in Functional Reactive Programming using RxJS.

### Function Signature
- The next system message will describe a node in the system, specifying the input streams and the nodes that provide them.
- You will receive IDs for these input streams. You MAY these IDs to find the corresponding streams in the \`inputs\` array.
- Your task is to write a pure JavaScript function snippet according to the following signature:
\`\`\`
function (inputs, stopObservable, errorObservable) {
    // ...
    return outputs;
}
\`\`\`

### Arguments
- An array of input streams (defined below)
- A stop observable - an observable that will emit a single value when the system is shutting down and the function should clean up any resources it has allocated.
- An error observable - an observable that should emit an error if the function encounters an error.

### Return Value
- An array of output streams (defined below)

### this API
- The \`this\` object will contain the following properties and methods:
    - \`this.id\` - the ID of the node that this function is attached to.
    - \`this.createStream(definition)\` - a function that creates a new stream and returns it. The definition object is defined below.
    - \`this.createForm(definition)\` - a function that creates a new form and returns two streams, one which emits the form data on submit, and one which emits the form data on change. The definition object is the same as for streams and is defined below.
    - \`this.cors(url)\` - a function that returns a CORS-enabled version of the URL.
    - \`this.Swal\` - a reference to the SweetAlert2 library.
    - \`this.Readability\` - a reference to the Readability library from mozilla.
    - \`this.rxjs\` - a reference to the RxJS library.
    - \`this.rxjsOperators\` - a reference to the RxJS operators.

### Code Requirements
- Ensure your code is runnable in a browser environment without requiring transpilation. That means no TypeScript, JSX, or NodeJS-specific APIs unless they can be commonly polyfilled.
- For imports, use inline \`async import()\` syntax from \`https://esm.sh/\`. Make sure to specify the version.
- **Important Note on RxJS**: The import paths for RxJS operators have changed. Instead of importing from \`rxjs/operators\`, you should now use \`rxjs\`:
  - for example, to import map and filter: \`const { map, filter } = await import('https://esm.sh/rxjs')\`.
- For default exports, explicitly specify the \`default\` keyword.
- All read/write to streams should be done via the \`subject\` property of the stream object.
- Your function MUST return an array of output streams, or an empty array if there are no output streams.
- You MUST use the \`stopObservable\` to terminate your pipeline when it emits a signal.
- Any runtime errors that occur within your function MUST be sent to the \`errorObservable\`.
- You MUST ONLY return the function declaration. DO NOT invoke the function or return anything else.
- You MUST display any alerts or toasts to the user via the \`this.Swal\` object unless directed otherwise.
- You SHOULD use the \`toast\` parameter of \`this.Swal\` to display toasts instead of alerts, unless directed otherwise.
  - Proper usage: \`this.Swal.fire({ title: 'Hello World!', toast: true, ... })\`
  - provide elegant minimalist styling for toasts, and present them in the top right corner of the screen.
- You MUST wrap all URLs with a CORS proxy using \`this.cors(url)\` unless directed otherwise.
- You MUST NOT include the \`subject\` property in your stream definitions. This will be automatically generated for you.
- You MUST create your output streams using \`this.createStream(definition)\`.
- You MUST NOT use an absolute index to access the input streams. Instead, use \`.find()\` to find the input stream by ID or .filter() to find the input streams by type.
- You SHOULD provide a \`type\` property in your stream definitions. This will be used to find the input streams by type.
- You MUST use this.createForm(definition) to create forms when directed to do so.
- You MUST include both streams returned by this.createForm(definition) in your output streams.
- You MUST use this.cors(url) to wrap all URLs unless directed otherwise.
- You SHOULD subscribe to upstream onSubmit inputs when dealing with form data, but you MAY do otherwise if it better fulfills the requirements.
- You MUST not import any libraries that are not supported in the browser environment.
- You SHOULD use this.Readability for any HTML parsing needs, but you MAY use another library if it better fulfills the requirements.
- You MUST NOT use the 'format' key in any JSON schema.
- You MUST include all outputs in the return value, you MUST NOT add any additional outputs to the output array asynchonously.
- You MUST NOT use any meta inputs in your function unless directed otherwise. These are inputs that are meant for the system to use, not for your function to use.
- You MUST set the response type of all HTTP requests to the appropriate type explicitly.
- You MUST specify the version of all imports in the URL.

### Stream Schema
- This is the JSON schema for a stream:
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

### Stream Definition Schema
- This is the JSON schema for a stream definition:
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
    "uiSchema": {
        "type": "object"
        "description": "a ui Schema to help render any forms via react-json-schema-form"
    }
  },
  "required": ["name", "description", "schema"]
}
\`\`\`

Your output MUST be presented in a single Markdown code block containing only the function definition.
You MAY present a short explanation of your solution before the code block.
`;

const MAGIC_QUESTIONS = [
    {
        question: "Is the code a single async function?",
        options: ["yes", "no"],
    },
    {
        question: [
            "Does the code match the description, doing what the description says it should do?",
        ],
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code properly reference the inputs, using correct keys or types as appropriate?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code properly return an output array of streams, or an empty array?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code properly use the stopObservable to clean up any internal pipelines?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code properly use the errorObservable to report any internal errors?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code adhere to all Code Requirements, regarding api usage?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code use browser native fetch instead of node-fetch?",
        options: ["yes", "no"],
    },
    {
        question:
            "Are all form definitions valid for use with react-json-schema-form, with correct uiSchema if applicable?",
        options: ["yes", "no"],
    },
    {
        question:
            "Is the code free from any TypeScript or JSX syntax, as well as free from any attempts to import type files?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code explicitly set the response type of all HTTP requests to the appropriate type?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code only call `this.createStream()` in the top scope of the function?",
        options: ["yes", "no"],
    },
    {
        question:
            "Does the code specify the version of all imports in the URL?",
        options: ["yes", "no"],
    },
];

export class MagicTransformer extends Transformer {
    static Component = MagicElement;
    static inputs = [
        {
            label: "api_key",
            name: "OpenAI API Key",
            global: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    api_key: {
                        type: "string",
                        title: "Key",
                        minLength: 51,
                        maxLength: 51,
                        description:
                            "https://platform.openai.com/account/api-keys",
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

    chatStreams = new Subject();

    upstream = new BehaviorSubject([this.meta]); // Initialized with meta
    downstream = new BehaviorSubject([]);
    transformFunctions$ = new BehaviorSubject(chatTransform.bind(this));
    transformErrors$ = new Subject();
    gpt = new BehaviorSubject(null);
    openaiApi = new BehaviorSubject(null);

    Swal = Swal;
    Readability = Readability;
    rxjs = rxjs;
    rxjsOperators = rxjs;

    constructor(ide, canvasId, data = MagicTransformer, id) {
        super(ide, canvasId, data, id);
        this.corsProxyUrl = "http://localhost:8080/";
        this.cors = this.cors.bind(this);
        this.createStream = this.createStream.bind(this);
        this.nodeRemoved$ = new Subject();
        this.setup();
    }

    questionMap(config = {}) {
        config.model ||= "gpt-4";
        config.temperature ||= 0.4;
        config.n = 1;
        const mergeStrategy = config.mergeStrategy || "first";
        delete config.mergeStrategy;
        const questions = config.questions;
        delete config.questions;
        const questionMessage = [
            {
                role: "system",
                content: [
                    "Please answer the following questions to the best of your ability",
                    `You are a careful reviewer, known for catching subtle errors`,
                    `The context containing the code and other guidelines will be provided after the questions`,
                ]
                    .concat([
                        questions.map(({ question, options }, i) => [
                            `[${i++}] ${question}`,
                            options.map(
                                (option, index) => `${index + 1}) ${option}`
                            ),
                        ]),
                    ])
                    .flat()
                    .join("\n"),
            },
        ];
        return switchMap((messages) => {
            return this.openaiApi.pipe(
                filter((openai) => !!openai),
                take(1),
                switchMap((openai) => {
                    try {
                        return openai.chat.completions
                            .create({
                                ...config,
                                messages: questionMessage
                                    .concat(
                                        messages.map((message) =>
                                            !Array.isArray(message) ||
                                            mergeStrategy === "all"
                                                ? message
                                                : message[0]
                                        )
                                    )
                                    .flat(),
                                functions: [
                                    {
                                        name: "answer_questions",
                                        description:
                                            "provide answers to all questions asked",
                                        parameters: {
                                            type: "object",
                                            properties: {
                                                answers: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            question: {
                                                                type: "number",
                                                                description:
                                                                    "the number of the question",
                                                            },
                                                            explanation: {
                                                                type: "string",
                                                                description:
                                                                    "a short explanation of the answer",
                                                            },
                                                            answer: {
                                                                type: "number",
                                                                description:
                                                                    "the number of the answer",
                                                            },
                                                        },
                                                        required: [
                                                            "question",
                                                            "answer",
                                                            "explanation",
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                    },
                                ],
                                function_call: {
                                    name: "answer_questions",
                                },
                            })
                            .then((res) =>
                                JSON.parse(
                                    res.choices[0].message.function_call
                                        .arguments
                                )
                            );
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

    async chatCall(config, openai) {
        const remainder = config.quantity - 1;
        const mergeStrategy = config.mergeStrategy || "first";

        const stream = await openai.chat.completions.create({
            ...config,
            stream: true,
            messages: config.messages
                .map((message) =>
                    !Array.isArray(message) || mergeStrategy === "all"
                        ? message
                        : message[0]
                )
                .flat(),
        });

        let outputStream = new BehaviorSubject("");
        let content = "";
        this.chatStreams.next(outputStream);

        let allResponses = await Promise.all([
            (async () => {
                for await (const part of stream) {
                    const delta = part.choices[0]?.delta?.content || "";
                    content += delta;
                    console.log(content);
                    outputStream.next(content);
                }
                return content;
            })(),
            (async () => {
                if (remainder > 0) {
                    const e = await openai.chat.completions.create({
                        model: config.model,
                        messages,
                        temperature: config.temperature,
                        n: remainder,
                    });
                    const choices = e.choices.map((e) => e.message.content);
                    return choices;
                }
                return [];
            })(),
        ]);
        allResponses = allResponses.flat().map((content) => ({
            role: "assistant",
            content,
        }));

        return [
            ...config.messages,
            allResponses.length > 1 ? allResponses : allResponses[0],
        ];
    }

    chatMap(config = {}) {
        config.model ||= "gpt-4";
        config.temperature ||= 0.4;
        return switchMap((messages) => {
            return this.openaiApi.pipe(
                filter((openai) => !!openai),
                take(1),
                switchMap((openai) => {
                    try {
                        return this.chatCall({ ...config, messages }, openai);
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

    debug(message) {
        return tap((value) => {
            console.log(
                this.id,
                this.meta.subject.getValue().name,
                message,
                value
            );
        });
    }

    async setup() {
        await this.ready;
        this.transformCode$ = this.createStream({
            name: "transformCode",
            type: "transform",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    code: {
                        type: "string",
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

        this.watchUpstreams();

        const needsRedoCode$ = this.transformErrors$;

        this.applyTransforms();

        this.getInput("api_key")
            .subject.pipe(
                filter((e) => e?.api_key),
                map(({ api_key }) => {
                    console.log("got api key");
                    return new OpenAI({
                        apiKey: api_key,
                        dangerouslyAllowBrowser: true,
                    });
                })
            )
            .subscribe(this.openaiApi);

        this.initialCode$ = this.transformCode$.subject.pipe(
            this.debug("transformCode$ changed"),
            filter((e) => e && e.code),
            this.debug("transformCode$ changed"),
            takeUntil(this.nodeRemoved$),
            share()
        );

        const needRevisedCode$ = this.meta.subject.pipe(
            filter((e) => e && e.name !== "New Magic Node"),
            this.debug("needRevisedCode$ meta changed"),
            withLatestFrom(this.upstream, this.initialCode$),
            this.debug("meta changed and upstream and initialCode$ changed"),
            filter(
                ([meta, upstream, transform]) =>
                    !(meta.fromStore && transform.fromStore)
            ),
            this.debug("needRevisedCode$ check"),
            map(([{ name, description }, upstream, transform]) => {
                const code = transform.code;
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
                    `# Node under review`,
                    this.meta.toPromptString(),
                    `# Upstream nodes`,
                    upstreamMeta.map((stream) => stream.toPromptString()),
                    `# Available streams`,
                    upstreamAvailable.map((stream) => stream.toPromptString()),
                    `# Code under review`,
                    `\`\`\`js\n${code}\n\`\`\``,
                ]
                    .flat()
                    .join("\n");

                const messages = [
                    {
                        role: "system",
                        content,
                    },
                ];

                return messages;
            }),
            this.questionMap({
                questions: MAGIC_QUESTIONS,
            }),
            this.debug("needRevisedCode$ questionMap"),
            filter((e) => e.answers.filter((a) => a.answer === 2).length),
            this.debug("needRevisedCode$ true"),
            takeUntil(this.nodeRemoved$),
            share()
        );

        const needFirstCode$ = combineLatest(
            this.upstream.pipe(this.debug("needFirstCode$ upstream changed")),
            this.meta.subject.pipe(
                this.debug("needFirstCode$ meta changed"),
                filter((e) => e && e.name !== "New Magic Node")
            ),
            this.transformCode$.firstCreation.pipe(
                this.debug("needFirstCode$ firstCreation changed")
            )
        ).pipe(tap((e) => console.log("needFirstCode$", this.id, e)));

        const needCode$ = merge(
            needFirstCode$,
            needRevisedCode$,
            needsRedoCode$
        );

        needCode$
            .pipe(
                this.debug("needCode$ changed"),
                withLatestFrom(
                    this.upstream,
                    this.meta.subject.pipe(
                        filter((e) => e && e.name !== "New Magic Node")
                    )
                ),
                this.debug("needCode$ with latest from upstream and meta"),
                map(([needCode, upstream, _meta]) => {
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
                        `# Grading questions`,
                        `Your code must pass the following tests:`,
                        MAGIC_QUESTIONS.map((q) => q.question),
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
                filter((e) => e),
                takeUntil(this.nodeRemoved$)
            )
            .subscribe(this.initialCode$);

        this.initialCode$
            .pipe(
                filter((e) => e.code),
                this.debug("initialCode$ make into function"),
                mergeMap(this.createAsyncFunctionFromString.bind(this)),
                this.debug("initialCode$ made into function"),
                filter((e) => e),
                this.debug(
                    "initialCode$ transformed into function successfully"
                ),
                takeUntil(this.nodeRemoved$),
                share()
            )
            .subscribe(this.transformFunctions$);

        // this.downstream.pipe(skip(2)).subscribe(() => this.requestSnapshot());
    }

    createStream(definition) {
        return new Stream(this, definition);
    }

    createChatInput() {
        const chatInput = document.createElement("chat-input");
        chatInput.subject = new Subject();
        chatInput.handleFocus = () => {
            this.selected = true;
            this.editorNode.requestUpdate();
        };
        chatInput.handleBlur = () => {
            this.selected = false;
            this.editorNode.requestUpdate();
        };

        this.component.replaceChildren(chatInput);
        return chatInput.subject;
    }

    createForm(definition) {
        definition = JSON.parse(JSON.stringify(definition));
        const onChange = this.createStream({
            ...definition,
            name: definition.name + " onChange",
        });
        const onSubmit = this.createStream({
            ...definition,
            name: definition.name + " onSubmit",
        });
        definition.onChange = (e) => {
            console.log("onChange", e);
            onChange.subject.next(e.formData);
        };
        definition.onSubmit = (e) => {
            console.log("onSubmit", e);
            onSubmit.subject.next(e.formData);
        };
        const rjsfComponent = document.createElement("rjsf-component");
        rjsfComponent.setAttribute("is-open", "true");
        rjsfComponent.props = definition;

        this.component.replaceChildren(rjsfComponent);

        return [onChange, onSubmit];
    }

    watchUpstreams() {
        const rawUpstreams$ = this.canvas.editorStream.pipe(
            filter((event) => event),
            this.debug("rawUpstreams$ got editor event"),
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
            this.debug("rawUpstreams$ changed"),
            switchMap((connectedNodes) => {
                const downstreams = connectedNodes.map(
                    (node) => node.downstream
                );
                return combineLatest(downstreams).pipe(
                    map((arrays) => {
                        const uniqueArray = [...new Set([].concat(...arrays))];
                        // Always include meta object in the upstream
                        return [this.meta, ...uniqueArray];
                    })
                );
            }),
            this.debug("rawUpstreams$ combined downstreams"),
            distinctUntilChanged((v1, v2) =>
                deepEqual(
                    v1.map(({ id }) => id).sort(),
                    v2.map(({ id }) => id).sort()
                )
            ),
            this.debug("upstream changed"),
            takeUntil(this.nodeRemoved$),
            shareReplay()
        );

        const lastUpstream = new ReplaySubject(1);
        rawUpstreams$.subscribe(lastUpstream);

        this.canvas.store.updates.read
            .pipe(
                take(1), // Take only the first emission from b$
                switchMap(() =>
                    concat(
                        lastUpstream, // Emit the last value from a$
                        rawUpstreams$ // Then emit all values from a$
                    )
                ),
                filter((streams) => {
                    const minStreams = Math.max(
                        2,
                        (streams.filter((stream) => stream.type === "meta")
                            .length -
                            1) *
                            2
                    );
                    // console.log(
                    //     "upstream filter,",
                    //     !this.hasConnection("inputs"),
                    //     minStreams,
                    //     streams.length
                    // );
                    if (!this.hasConnection("inputs")) {
                        // we're loaded but not connected to anything, so we're ready
                        return true;
                    }

                    // we need at least one stream from each upstream node other than ourselves.
                    // this should be more thorough.
                    if (streams.length >= minStreams) {
                        return true;
                    }
                }),
                this.debug("upstream filter passed"),
                takeUntil(this.nodeRemoved$)
            )
            .subscribe(this.upstream);
    }

    applyTransforms() {
        combineLatest([this.upstream, this.transformFunctions$])
            .pipe(
                this.debug("upstream and transformFunctions$ changed"),
                switchMap(async ([streams, transform]) => {
                    // Create a new stop signal for this run
                    const currentTransformStop$ = new Subject();
                    let isError = false;
                    let transformedStreams;
                    let error;

                    try {
                        const stopObservable = merge(
                            this.nodeRemoved$,
                            currentTransformStop$
                        );
                        stopObservable.subject = stopObservable;
                        const errorObservable = this.transformErrors$;
                        errorObservable.subject = errorObservable;

                        transformedStreams = await transform(
                            streams,
                            stopObservable,
                            errorObservable
                        );
                        if (!Array.isArray(transformedStreams)) {
                            throw new Error(
                                "Transform function must return an array of streams"
                            );
                        }

                        if (
                            !transformedStreams.every(
                                (stream) => stream instanceof Stream
                            )
                        ) {
                            throw new Error(
                                "Transform function must return an array of streams"
                            );
                        }
                    } catch (e) {
                        isError = true;
                        error = e;
                        console.error("An error occurred:", error);
                        console.log(streams, transform);
                        this.transformErrors$.next(e);
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
                this.debug("transformedStreams changed"),
                filter(({ transformed }) => transformed !== null),
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

    async createAsyncFunctionFromString({ code }) {
        code = code.trim();

        // Prepend 'export default' to make it an ES6 module
        const moduleCode = `export default ${code}`
            .split("\n")
            .map((line, i) => {
                // if (!i) {
                //     return line + "\ndebugger;";
                // }
                return line;
            })
            .join("\n");

        // Create a blob object and construct its URL
        const blob = new Blob([moduleCode], { type: "application/javascript" });
        const objectURL = URL.createObjectURL(blob);

        try {
            // Dynamically import the module
            const importedModule = await import(objectURL);

            // Revoke the object URL to free up memory
            URL.revokeObjectURL(objectURL);

            // Bind 'this' to the imported function and return it
            return importedModule.default.bind(this);
        } catch (e) {
            console.error("Error importing function:", e);

            this.transformErrors$.next(e);
            // Revoke the object URL to free up memory even in case of an error
            URL.revokeObjectURL(objectURL);

            return null;
        }
    }
}

Transformer.childClasses.set("MagicTransformer", MagicTransformer);
