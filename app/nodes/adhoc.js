import { Transformer } from "../transformer.js";

export class AdhocTransformer extends Transformer {
    static inputs = [
        {
            label: "config",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                required: ["inputs", "outputs", "transform"],
                properties: {
                    inputs: {
                        type: "array",
                        description: "Array of input definitions",
                        items: {
                            type: "object",
                            required: ["label", "schema"],
                            properties: {
                                label: {
                                    type: "string",
                                    description: "Label for the input",
                                },
                                schema: {
                                    type: "string",
                                    description:
                                        "JSON Schema for the input as multiline text",
                                    format: "textarea",
                                },
                                uischema: {
                                    type: "string",
                                    description:
                                        "UI Schema for the input form as multiline text",
                                    format: "textarea",
                                },
                                showSubmit: {
                                    type: "boolean",
                                    description: "Show submit button",
                                    default: false,
                                },
                            },
                        },
                    },
                    outputs: {
                        type: "array",
                        description: "Array of output definitions",
                        items: {
                            type: "object",
                            required: ["label", "schema"],
                            properties: {
                                label: {
                                    type: "string",
                                    description: "Label for the output",
                                },
                                schema: {
                                    type: "string",
                                    description: "JSON Schema for the output",
                                    format: "textarea",
                                },
                            },
                        },
                    },
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
                },
            },
            uiSchema: {
                inputs: {
                    items: {
                        label: {
                            "ui:widget": "text",
                        },
                        schema: {
                            "ui:widget": "textarea",
                            "ui:options": {
                                rows: 5,
                            },
                        },
                        uischema: {
                            "ui:widget": "textarea",
                            "ui:options": {
                                rows: 5,
                            },
                        },
                        showSubmit: {
                            "ui:widget": "checkbox",
                        },
                    },
                },
                outputs: {
                    items: {
                        label: {
                            "ui:widget": "text",
                        },
                        schema: {
                            "ui:widget": "textarea",
                            "ui:options": {
                                rows: 5,
                            },
                        },
                    },
                },
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
            },
        },
    ];

    // Implementation of the transform method and other methods
    async transform() {
        // Your custom implementation here
        this.subscribtion = this.getInput("config").subject.subscribe(
            async (config) => {
                if (!config) return;
                this.clearIO();
                this.transformCleanup?.();

                this.processIO(
                    config.inputs.map(
                        ({ label, schema, uischema, showSubmit }) => ({
                            label,
                            schema: JSON.parse(schema),
                            uischema: uischema
                                ? JSON.parse(uischema)
                                : undefined,
                            showSubmit,
                        })
                    ),
                    false,
                    this.addInput.bind(this)
                );
                this.processIO(
                    config.outputs.map(({ label, schema }) => ({
                        label,
                        schema: JSON.parse(schema),
                    })),
                    true,
                    this.addOutput.bind(this)
                );

                this.transformCleanup =
                    await this.createAsyncFunctionFromString(config.transform);
            }
        );
    }

    createAsyncFunctionFromString(bodyString) {
        const asyncFunction = new Function(
            "return (async function() {" + bodyString + "}).bind(this);"
        );

        return asyncFunction.call(this)();
    }
}

Transformer.childClasses.set("AdhocTransformer", AdhocTransformer);
