import { LitElement, css, html } from "https://esm.sh/lit";
import validator from "https://esm.sh/@rjsf/validator-ajv8?alias=lodash:lodash-es";
import Form from "https://esm.sh/@rjsf/bootstrap-4?alias=lodash:lodash-es,deps=react@18.2.0,react-dom@18.2.0";

import { SafeSubject as BehaviorSubject } from "./safe-subject.js";
import { PropagationStopper, CardStyleMixin } from "./mixins.js";
import { bootstrapCss } from "./bootstrap.css.js";
import "./react.js";
export function setSubmitButtonOptions(uiSchema, options) {
    const newUiSchema = uiSchema || {};
    newUiSchema["ui:submitButtonOptions"] = {
        ...newUiSchema["ui:submitButtonOptions"], // Preserve existing options if they exist
        ...options, // Merge with new options
    };
    return newUiSchema;
}
export const RJSFComponent = CardStyleMixin(
    PropagationStopper(
        class RJSFComponentBase extends LitElement {
            static styles = [
                bootstrapCss,
                css`
                    :host {
                        display: block;
                        overflow: auto;
                    }
                `,
            ];

            static properties = {
                props: { type: Object },
            };

            // Create a new Subject to receive change events
            subject = new BehaviorSubject();
            debounceTime = 5000;

            constructor() {
                super();
                this._props = {
                    schema: {},
                    uiSchema: {},
                    formData: {},
                    onSubmit: (e) => {
                        this.props.subject?.next(e.formData);
                        this.props.node?.requestSnapshot();
                    },
                    validator: validator,
                };
                // console.log("props?", this.props);
            }

            updated(changedProperties) {
                if (this.reactWrapper && changedProperties.has("props")) {
                    this.reactWrapper.props = {
                        ...this.reactWrapper.props,
                        formData: this.props.subject?.getValue(),
                    };
                }
            }

            firstUpdated() {
                const reactWrapper = (this.reactWrapper =
                    document.createElement("react-wrapper"));
                reactWrapper.reactComponent = Form;
                reactWrapper.props = {
                    ...this._props,
                    ...this.props,
                    formData: this.props.subject?.getValue(),
                    uiSchema: setSubmitButtonOptions(
                        this.props.uiSchema || {},
                        {
                            submitText: "Save",
                        }
                    ),
                };
                reactWrapper.props.subject?.subscribe((e) => {
                    console.log("react-wrapper", e);
                    reactWrapper.props = { ...reactWrapper.props, formData: e };
                });
                console.log(reactWrapper.props);
                this.appendChild(reactWrapper);
            }

            render() {
                return html`<div style="font-size: 1.3rem; font-weight: bold;">
                        ${this.props.name || this.props.label}
                    </div>
                    <slot></slot>`; // Exposed slot for the React content
            }
        }
    )
);
customElements.define("rjsf-component", RJSFComponent);
