import { LitElement, css, html } from "https://esm.sh/lit";
import { combineLatest, map, mergeMap, filter } from "https://esm.sh/rxjs";
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
            chainable: true,
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
                    quantity: {
                        type: "number",
                        minimum: 1,
                        maximum: 10,
                        default: 1,
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
            label: "choices",
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    ];

    constructor(ide, canvasId, data = OpenAITransformer, id) {
        super(ide, canvasId, data, id);
    }

    transform() {
        let lastStream = null;
        combineLatest([
            this.getInput("config").subject.pipe(filter((i) => i)),
            this.getInput("history").subject.pipe(
                filter((e) => {
                    // console.log("history", e);
                    return e || !this.hasConnection("history");
                }),
                map((e) => (e ? e : []))
            ),
            this.getInput("prompt").subject.pipe(filter((i) => i)),
        ])
            .pipe(
                mergeMap(async ([config, history, prompt]) => {
                    const messages = [...history, { role: "user", ...prompt }];
                    // console.log("openai", config, history, prompt);
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

                        const remainder = config.quantity - 1;

                        const stream = (lastStream =
                            await this.openai.chat.completions.create({
                                model: config.model,
                                messages,
                                temperature: config.temperature,
                                stream: config.stream,
                            }));

                        let outputStream = new BehaviorSubject("");
                        this.getOutput("stream").subject.next(outputStream);
                        let streamDone = false;

                        let content = "";

                        if (remainder > 0) {
                            this.openai.chat.completions
                                .create({
                                    model: config.model,
                                    messages,
                                    temperature: config.temperature,
                                    n: remainder,
                                })
                                .then(async (e) => {
                                    while (!streamDone) {
                                        await new Promise((resolve) =>
                                            setTimeout(resolve, 1000)
                                        );
                                    }

                                    const choices = e.choices
                                        .map((e) => e.message.content)
                                        .concat(content);
                                    this.getOutput("choices").subject.next(
                                        choices
                                    );
                                });
                        }

                        for await (const part of stream) {
                            const delta = part.choices[0]?.delta?.content || "";
                            content += delta;
                            outputStream.next(content);
                        }
                        streamDone = true;

                        return [
                            ...messages,
                            { role: "assistant", content: content },
                        ];
                    } catch (e) {
                        console.error(e);
                        this.openai = null;
                    }
                }),
                filter((e) => e)
            )
            .subscribe(this.getOutput("history").subject);
    }
}

Transformer.childClasses.set(
    OpenAITransformer.toString().match(/\w+/g)[1],
    OpenAITransformer
);
