export const uiSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        "ui:order": {
            type: "array",
            items: {
                type: "string",
            },
        },
        "ui:widget": {
            type: "string",
            enum: [
                "text",
                "password",
                "textarea",
                "color",
                "checkbox",
                "radio",
                "select",
                "range",
                "updown",
                "date",
                "hidden",
            ],
        },
        "ui:options": {
            type: "object",
            properties: {
                label: {
                    type: "boolean",
                },
                inline: {
                    type: "boolean",
                },
                inputType: {
                    type: "string",
                },
                rows: {
                    type: "integer",
                },
                min: {
                    type: "integer",
                },
                max: {
                    type: "integer",
                },
            },
            additionalProperties: true,
        },
        "ui:field": {
            type: "string",
        },
        "ui:autofocus": {
            type: "boolean",
        },
        "ui:disabled": {
            type: "boolean",
        },
        "ui:readonly": {
            type: "boolean",
        },
        "ui:placeholder": {
            type: "string",
        },
    },
    additionalProperties: {
        $ref: "#",
    },
};
