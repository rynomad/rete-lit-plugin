import { Transformer } from "../transformer.js";
import { jsonSchema } from "../schemas/json-schema.js";
import { uiSchema } from "../schemas/ui-schema.js";
import { SafeSubject as BehaviorSubject } from "../safe-subject.js";
import * as rxjs from "https://esm.sh/rxjs@7.3.0";
import { map } from "https://esm.sh/rxjs@7.3.0";
export class AdhocTransformer extends Transformer {
    static inputs = [
        {
            label: "config",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                required: ["transform", "inputStrategy"],
                properties: {
                    transform: {
                        type: "string",
                        description: "Transformation logic as multiline text",
                        format: "textarea",
                    },
                    widget: {
                        type: "string",
                        description:
                            "Class definition for the widget that extends LitElement, as multiline text",
                        format: "textarea",
                    },
                    inputStrategy: {
                        type: "string",
                        enum: ["zip", "combineLatest"],
                        default: "combineLatest",
                    },
                },
            },
            uiSchema: {
                transform: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 10,
                    },
                },
                widget: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 10,
                    },
                },
                inputStrategy: {
                    "ui:widget": "radio",
                },
            },
        },
        {
            label: "description",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                required: ["description"],
                properties: {
                    description: {
                        type: "string",
                        description: "Description as multiline text",
                        format: "textarea",
                    },
                },
            },
            uiSchema: {
                description: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 10,
                    },
                },
            },
        },
        {
            label: "inputs",
            multipleConnections: "combineLatest",
        },
    ];

    getInput(label) {
        let input = super.getInput(label);
        if (!input) {
            this.addInput({
                label,
                socket: this.socket,
                subject: new BehaviorSubject(),
                validate: () => true,
            });
            return this.getInput(label);
        }

        return input;
    }

    getOutput(label) {
        let output = super.getOutput(label);
        if (!output) {
            this.addOutput({
                label,
                socket: this.socket,
                subject: new BehaviorSubject(),
                validate: () => true,
            });
            return this.getOutput(label);
        }
        return output;
    }

    clearIO() {
        for (const key in this.inputs) {
            if (
                key.endsWith("config") ||
                key.endsWith("description") ||
                key.endsWith("inputs")
            )
                continue;
            this.removeInput(key);
        }

        for (const key in this.outputs) {
            this.removeOutput(key);
        }
    }

    // Implementation of the transform method and other methods
    async transform() {
        // Your custom implementation here
        this.subscribtion = this.getInput("config").subject.subscribe(
            async (config) => {
                if (!config) return;
                try {
                    if (
                        config.inputStrategy !==
                        this.getInput("inputs").multipleConnections
                    ) {
                        const inputs = this.getInput("inputs");
                        inputs.multipleConnections = config.inputStrategy;
                        inputs.subscription?.unsubscribe();
                        inputs.multiInputs = this.editor
                            .getConnections()
                            .filter((c) => {
                                return (
                                    c.targetInput === targetInput.key &&
                                    c.target === this.id
                                );
                            })
                            .map((c) => {
                                const sourceNode = this.editor.getNode(
                                    context.source
                                );
                                let sourceOutput =
                                    sourceNode.outputs[context.sourceOutput];
                                return sourceOutput;
                            });

                        inputs.subscription = this.multiInputsToObject(
                            inputs.multipleConnections,
                            inputs.multiInputs
                        ).subscribe((v) => targetInput.subject.next(v));
                    }
                    try {
                        this.transformCleanup?.unsubscribe?.();
                        this.transformCleanup?.();
                    } catch (e) {
                        console.warn(e);
                    }
                    this.transformCleanup =
                        await this.createAsyncFunctionFromString(
                            config.transform
                        );
                } catch (e) {
                    console.warn(e);
                }
            }
        );
    }

    createAsyncFunctionFromString(bodyString) {
        const asyncFunction = new Function(
            "rxjs",
            "return (async function() {" + bodyString + "}).bind(this);"
        );

        // Then call the function and pass rxjs as an argument
        return asyncFunction.call(this, rxjs)();
    }
}

Transformer.childClasses.set("AdhocTransformer", AdhocTransformer);
