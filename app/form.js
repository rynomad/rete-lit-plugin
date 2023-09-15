import { LitElement, css, html } from "https://esm.sh/lit";
import validator from "https://esm.sh/@rjsf/validator-ajv8?alias=lodash:lodash-es";
import Form from "https://esm.sh/@rjsf/bootstrap-4?alias=lodash:lodash-es,deps=react@18.2.0,react-dom@18.2.0";

import { SafeSubject as BehaviorSubject } from "./safe-subject.js";
import { PropagationStopper, CardStyleMixin } from "./mixins.js";
import { bootstrapCss } from "./bootstrap.css.js";
import "./react.js";

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
                    onSubmit: () => {},
                    onChange: (e) => {
                        console.log("onchange");
                        this.form.next(e.formData);
                    }, // Send change events to the Subject
                    validator: validator,
                };
                // console.log("props?", this.props);
            }

            firstUpdated() {
                const reactWrapper = document.createElement("react-wrapper");
                reactWrapper.stylesheet =
                    "https://esm.sh/bootstrap@4/dist/css/bootstrap.min.css";
                reactWrapper.reactComponent = Form;
                reactWrapper.props = { ...this._props, ...this.props };
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
