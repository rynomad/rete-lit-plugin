import { LitElement, css, html } from "https://esm.sh/lit";
import {
    combineLatest,
    map,
    mergeMap,
    filter,
    debounceTime,
    tap,
    distinctUntilChanged,
} from "https://esm.sh/rxjs";
import deepEqual from "https://esm.sh/fast-deep-equal";
import { unsafeHTML } from "https://esm.sh/lit/directives/unsafe-html";
import OpenAI from "https://esm.sh/openai";
import { marked } from "https://esm.sh/marked";
import { CardStyleMixin } from "../mixins.js";
import { Transformer } from "../transformer.js";
import { SafeSubject as BehaviorSubject } from "../safe-subject.js";

const StreamRenderer = CardStyleMixin(
    class extends LitElement {
        static styles = css`
            :host {
                display: block;
                padding: 16px;
                color: var(--stream-renderer-text-color, black);
                max-width: 500px;
            }
        `;

        static properties = {
            node: { type: Object },
        };

        constructor() {
            super();
        }

        connectedCallback() {
            super.connectedCallback();
            if (this.node.getOutput("stream")) {
                this.node
                    .getOutput("stream")
                    .subject.pipe(filter((e) => e))
                    .subscribe((content) => {
                        content.subscribe(this.renderContent.bind(this));
                    });
            }
        }

        renderContent(content) {
            this.content = content ? marked(content) : "";
            this.requestUpdate();
        }

        render() {
            return html`
                <div class="content">${unsafeHTML(this.content)}</div>
            `;
        }
    }
);

customElements.define("stream-renderer", StreamRenderer);

export class OpenAITransformer extends Transformer {
    static Component = StreamRenderer;
    static inputs = [
        {
            label: "config",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    model: {
                        type: "string",
                        default: "gpt-4",
                    },
                    api_key: {
                        type: "string",
                    },
                    temperature: {
                        type: "number",
                        minimum: 0,
                        maximum: 2,
                    },
                    stream: {
                        type: "boolean",
                        default: true,
                    },
                },
                required: ["model", "api_key"],
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
            label: "chat",
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
    ];
    static outputs = [
        {
            label: "config",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                properties: {
                    model: {
                        type: "string",
                        default: "gpt-4",
                    },
                    temperature: {
                        type: "number",
                        minimum: 0,
                        maximum: 2,
                    },
                    stream: {
                        type: "boolean",
                        default: true,
                    },
                },
                required: ["model"],
            },
        },
        {
            label: "chat",
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
    ];

    constructor(ide, canvasId, data = OpenAITransformer, id) {
        super(ide, canvasId, data, id);
    }

    async transform() {
        let lastStream = null;
        combineLatest([
            this.getInput("config").subject.pipe(filter((i) => i)),
            this.getInput("chat").subject.pipe(filter((e) => e)),
        ])
            .pipe(
                mergeMap(async ([config, chat]) => {
                    try {
                        this.openai =
                            this.openai ||
                            new OpenAI({
                                apiKey: config.api_key,
                                dangerouslyAllowBrowser: true,
                            });
                        if (lastStream) {
                            await lastStream.controller.abort();
                        }
                        const stream = (lastStream =
                            await this.openai.chat.completions.create({
                                model: config.model,
                                messages: chat,
                                temperature: config.temperature,
                                stream: config.stream,
                            }));

                        let outputStream = new BehaviorSubject("");
                        this.getOutput("stream").subject.next(outputStream);

                        let content = "";
                        for await (const part of stream) {
                            const delta = part.choices[0]?.delta?.content || "";
                            content += delta;
                            outputStream.next(content);
                        }

                        return [
                            ...(chat || []),
                            { role: "assistant", content: content },
                        ];
                    } catch (e) {
                        console.error(e);
                        this.openai = null;
                    }
                }),
                filter((e) => e)
            )
            .subscribe(this.getOutput("chat").subject);

        this.getInput("config").subject.subscribe(
            this.getOutput("config").subject
        );
    }
}

export class PromptTransformer extends Transformer {
    static inputs = [
        {
            label: "prompt",
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
        {
            label: "chat",
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
    ];
    static outputs = [
        {
            label: "chat",
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
    ];

    constructor(ide, canvasId, data = PromptTransformer, id) {
        super(ide, canvasId, data, id);
    }

    transform() {
        combineLatest([
            this.getInput("prompt").subject.pipe(filter((i) => i)),
            this.getInput("chat").subject.pipe(
                debounceTime(1000),
                distinctUntilChanged(deepEqual)
            ),
        ])
            .pipe(
                map(([prompt, chat]) => {
                    console.log("prompt", prompt, chat);
                    return [
                        ...(chat || []),
                        {
                            role: prompt.role || "user",
                            content: prompt.content,
                        },
                    ];
                })
            )
            .subscribe(this.getOutput("chat").subject);
    }
}

Transformer.childClasses.set(
    OpenAITransformer.toString().match(/\w+/g)[1],
    OpenAITransformer
);
Transformer.childClasses.set(
    PromptTransformer.toString().match(/\w+/g)[1],
    PromptTransformer
);
