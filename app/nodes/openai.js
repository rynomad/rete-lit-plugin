import { LitElement, css, html } from "https://esm.sh/lit";
import {
    combineLatest,
    map,
    mergeMap,
    filter,
    switchMap,
    distinctUntilChanged,
    of,
} from "https://esm.sh/rxjs";
import { deepEqual } from "https://esm.sh/fast-equals";
import { unsafeHTML } from "https://esm.sh/lit/directives/unsafe-html";

import { marked } from "https://esm.sh/marked";
import { CardStyleMixin } from "../mixins.js";
import OpenAI from "https://esm.sh/openai";
import { Transformer, TransformerInput } from "../transformer.js";
import { SafeSubject as BehaviorSubject } from "../safe-subject.js";

class OpenAIRenderer extends LitElement {
    static properties = {
        stream: { type: Object },
    };

    connectedCallback() {
        super.connectedCallback();
        setInterval(() => {
            if (
                !this.node.getInput("prompt").subscription &&
                !this.promptStream
            ) {
                this.promptStream = this.node.getInput("prompt").subject.pipe(
                    filter((e) => e),
                    map((e) => e.content)
                );
                this.requestUpdate();
            } else if (
                this.node.getInput("prompt").subscription &&
                this.promptStream
            ) {
                this.promptStream = null;
                this.requestUpdate();
            }
        }, 1000);
    }

    render() {
        return html`
            ${this.promptStream
                ? html`<stream-renderer
                      .stream=${this.promptStream}></stream-renderer>`
                : ``}
            <stream-renderer
                .stream=${this.node.getOutput("stream")
                    .subject}></stream-renderer>
        `;
    }
}
customElements.define("openai-renderer", OpenAIRenderer);

export class OpenAITransformer extends Transformer {
    static Component = OpenAIRenderer;
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
            label: "config",
            showSubmit: true,
            chainable: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    model: {
                        type: "string",
                        default: "gpt-4",
                    },
                    chooser: {
                        type: "string",
                        enum: ["single", "all"],
                        default: "single",
                        description:
                            'This has no effect unless the upstream node is configured with quantity > 1. If "single", the rendered response is used as the assistant message to continue the conversation. If "all", all results are included in the history, as a series of assistand messages.',
                    },
                    temperature: {
                        type: "number",
                        minimum: 0,
                        maximum: 2,
                        default: 0.4,
                    },
                    quantity: {
                        type: "number",
                        minimum: 1,
                        maximum: 10,
                        default: 1,
                    },
                },
                required: ["model"],
            },
            uiSchema: {
                model: {},
                api_key: {
                    "ui:widget": "password",
                },
                temperature: {},
                stream: {},
            },
        },
        {
            label: "history",
            chainable: "manual",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "array",
                items: {
                    $ref: "#/definitions/historyItem",
                },
                definitions: {
                    historyItem: {
                        anyOf: [
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
                                    $ref: "#/definitions/historyItem",
                                },
                            },
                        ],
                    },
                },
            },
        },
        {
            label: "prompt",
            chainable: true,
            style: "width: 500px;",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        enum: ["user", "system", "assistant"],
                        default: "user",
                    },
                    content: {
                        type: "string",
                        format: "textarea",
                    },
                },
                required: ["content"],
            },
            user: true,
            uiSchema: {
                content: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 5,
                    },
                    classNames: "my-custom-class my-custom-class-wider",
                },
            },
        },
    ];
    static outputs = [
        {
            label: "stream",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    _rxjsObservable: {
                        type: "boolean",
                        default: true,
                    },
                },
                required: ["_rxjsObservable"],
            },
        },
        {
            label: "function",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    functions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    pattern: "^[a-zA-Z0-9_-]{1,64}$",
                                    description:
                                        "The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.",
                                },
                                description: {
                                    type: "string",
                                    description:
                                        "A description of what the function does, used by the model to choose when and how to call the function.",
                                },
                                parameters: {
                                    type: "object",
                                    description:
                                        "The parameters the functions accepts, described as a JSON Schema object.",
                                    properties: {},
                                    required: [],
                                },
                            },
                            required: ["name", "parameters"],
                        },
                    },
                },
                required: [],
                description:
                    "A list of functions the model may generate JSON inputs for.",
            },
        },
    ];

    constructor(ide, canvasId, data = OpenAITransformer, id) {
        super(ide, canvasId, data, id);
    }

    transform() {
        let lastStream = null;
        this.functions = new BehaviorSubject([]);
        combineLatest([
            this.getInput("api_key").subject.pipe(
                filter((i) => i?.api_key),
                map((i) => i.api_key)
            ),
            this.getInput("config").subject.pipe(filter((i) => i)),
            this.getInput("history").subject.pipe(
                filter((e) => {
                    // console.log("history", e);
                    return e || !this.hasConnection("history");
                }),
                map((e) => (e ? e : []))
            ),
            this.getInput("prompt").subject.pipe(filter((i) => i)),
            this.functions.pipe(filter((i) => i)),
        ])
            .pipe(
                mergeMap(
                    async ([api_key, config, history, prompt, functions]) => {
                        history =
                            config.chooser === "single"
                                ? history.map((i) => {
                                      if (!Array.isArray(i)) return i;

                                      return i[i.length - 1];
                                  })
                                : history.flat();

                        const messages = [
                            ...history,
                            { role: "user", ...prompt },
                        ];
                        // console.log("openai", config, history, prompt);
                        try {
                            this.openai =
                                this.openai ||
                                new OpenAI({
                                    apiKey: api_key,
                                    dangerouslyAllowBrowser: true,
                                });
                            if (lastStream) {
                                await lastStream.controller.abort();
                            }

                            const remainder = config.quantity - 1;

                            const stream = (lastStream =
                                await this.openai.chat.completions.create({
                                    model: config.model,
                                    messages,
                                    temperature: config.temperature,
                                    stream: functions.length > 0 ? false : true,
                                    functions,
                                    function_call: functions.length
                                        ? { name: functions[0].name }
                                        : undefined,
                                }));

                            let outputStream = new BehaviorSubject("");
                            this.getOutput("stream").subject.next(outputStream);
                            let streamDone = false;

                            let content = "";

                            let allResponses = await Promise.all([
                                (async () => {
                                    for await (const part of stream) {
                                        const delta =
                                            part.choices[0]?.delta?.content ||
                                            "";
                                        content += delta;
                                        outputStream.next(content);
                                    }
                                    return content;
                                })(),
                                (async () => {
                                    if (remainder > 0) {
                                        const e =
                                            await this.openai.chat.completions.create(
                                                {
                                                    model: config.model,
                                                    messages,
                                                    temperature:
                                                        config.temperature,
                                                    n: remainder,
                                                }
                                            );
                                        const choices = e.choices.map(
                                            (e) => e.message.content
                                        );
                                        return choices;
                                    }
                                    return [];
                                })(),
                            ]);
                            allResponses = allResponses
                                .flat()
                                .map((content) => ({
                                    role: "assistant",
                                    content,
                                }));

                            return [
                                ...messages,
                                allResponses.length > 1
                                    ? allResponses
                                    : allResponses[0],
                            ];
                        } catch (e) {
                            console.error(e);
                            this.openai = null;
                        }
                    }
                ),
                filter((e) => e)
            )
            .subscribe(this.getOutput("history").subject);

        this.outgoing
            .pipe(
                filter(
                    (e) =>
                        e &&
                        e.some((e) => e.output === this.getOutput("function"))
                ),
                map((e) =>
                    e
                        .filter((e) => e.output === this.getOutput("function"))
                        .map((e) => ({
                            name: e.input.label,
                            description: e.input.description,
                            parameters: e.input.schema,
                        }))
                )
            )
            .subscribe(this.functions);
    }
}

Transformer.childClasses.set(
    OpenAITransformer.toString().match(/\w+/g)[1],
    OpenAITransformer
);

class PromptRenderer extends LitElement {
    static properties = {
        node: { type: Object },
    };

    render() {
        return html`
            <stream-renderer
                .stream=${this.node.renderPrompt}></stream-renderer>
        `;
    }
}
customElements.define("prompt-renderer", PromptRenderer);
export class PromptTransformer extends Transformer {
    static Component = PromptRenderer;
    static inputs = [
        {
            label: "history",
            chainable: "manual",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
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
        },
        {
            label: "prompt",
            style: "width: 500px;",
            chainable: "manual",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        enum: ["user", "system", "assistant"],
                        default: "user",
                    },
                    variables: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    content: {
                        type: "string",
                        format: "textarea",
                    },
                },
                required: ["content"],
            },
            user: true,
            uiSchema: {
                content: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 5,
                    },
                    classNames: "my-custom-class my-custom-class-wider",
                },
            },
        },
    ];
    static outputs = [];

    constructor(ide, canvasId, data = OpenAITransformer, id) {
        super(ide, canvasId, data, id);
    }

    templateString(str, variables) {
        if (!variables) return str;

        const keys = Object.keys(variables);
        const values = Object.values(variables);

        // Create a new Function to evaluate the template string
        const func = new Function(...keys, `return \`${str}\`;`);

        // Apply the function with the given variables
        return func(...values);
    }

    transform() {
        const adhocInputs = {};
        const combinedAdHocVariables = this.getInput("prompt").subject.pipe(
            filter((e) => e),
            switchMap((e) => {
                if (e.variables?.length) {
                    // Remove non-existing variables
                    for (const key in adhocInputs) {
                        if (!e.variables.includes(key)) {
                            this.removeInput(key);
                            delete adhocInputs[key];
                        }
                    }

                    // Add new variables
                    for (const variable of e.variables) {
                        if (this.getInput(variable)) continue;

                        const newInput = new TransformerInput({
                            label: variable,
                            multipleConnections: false,
                            subject: new BehaviorSubject(true),
                            validate: () => true,
                        });

                        this.addInput(newInput);
                        adhocInputs[variable] = newInput.subject;
                    }

                    const observables = Object.entries(adhocInputs).map(
                        ([key, obs]) =>
                            obs.pipe(map((value) => ({ [key]: value })))
                    );

                    return combineLatest(observables).pipe(
                        map((arr) =>
                            arr.reduce((acc, curr) => ({ ...acc, ...curr }), {})
                        )
                    );
                }

                // Emit empty array if there are no variables
                return of(null);
            })
        );

        const prompt = combineLatest([
            this.getInput("prompt").subject.pipe(filter((i) => i)),
            combinedAdHocVariables,
        ]).pipe(
            map(([prompt, variables]) => {
                return {
                    role: prompt.role || "user",
                    content: this.templateString(prompt.content, variables),
                };
            })
        );

        prompt.subscribe(this.getOutput("prompt").subject);

        this.renderPrompt = prompt.pipe(map((e) => of(e.content)));

        combineLatest([
            prompt,
            this.getInput("history").subject.pipe(filter((i) => i)),
        ])
            .pipe(map(([prompt, history]) => history.concat(prompt)))
            .subscribe(this.getOutput("history").subject);
    }
}
Transformer.childClasses.set(
    PromptTransformer.toString().match(/\w+/g)[1],
    PromptTransformer
);
