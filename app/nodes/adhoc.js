import { Transformer } from "../transformer.js";
import { jsonSchema } from "../schemas/json-schema.js";
import { uiSchema } from "../schemas/ui-schema.js";
import { SafeSubject as BehaviorSubject } from "../safe-subject.js";
import * as rxjs from "https://esm.sh/rxjs@7";
export class AdhocTransformer extends Transformer {
    static inputs = [
        {
            label: "transform",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                required: ["transform"],
                properties: {
                    transform: {
                        type: "string",
                        description: "Transformation logic as multiline text",
                        format: "textarea",
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
            },
        },
        {
            label: "widget",
            showSubmit: true,
            schema: {
                $schema: "http://json-schema.org/draft-07/schema#",
                type: "object",
                required: [],
                properties: {
                    widget: {
                        type: "string",
                        description:
                            "Class definition for the widget that extends LitElement, as multiline text",
                        format: "textarea",
                    },
                },
            },
            uiSchema: {
                widget: {
                    "ui:widget": "textarea",
                    "ui:options": {
                        rows: 10,
                    },
                },
            },
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
            if (key.endsWith("transform") || key.endsWith("widget")) continue;
            this.removeInput(key);
        }

        for (const key in this.outputs) {
            this.removeOutput(key);
        }
    }

    // Implementation of the transform method and other methods
    async transform() {
        // Your custom implementation here
        this.subscribtion = this.getInput("transform").subject.subscribe(
            async (config) => {
                if (!config) return;
                this.transformCleanup?.();

                this.transformCleanup =
                    await this.createAsyncFunctionFromString(config.transform);
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
