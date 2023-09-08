import React from "https://esm.sh/react@18.2.0?bundle";
import ReactDOM from "https://esm.sh/react-dom@18.2.0?bundle";
import { LitElement, css, html } from "https://esm.sh/lit";
import { bootstrapCss } from "./bootstrap.css.js";

class ReactWrapper extends LitElement {
    static styles = [
        bootstrapCss,
        css`
            :host {
                display: block;
            }
        `,
    ];

    static properties = {
        reactComponent: { type: Object },
        props: { type: Object },
        stylesheet: { type: String },
    };

    reactRoot = null;

    constructor() {
        super();
        this.reactComponent = null;
        this.props = {};
    }

    firstUpdated() {
        this.reactRoot = this.shadowRoot.querySelector("#react-root");
        this.renderReactComponent();
    }

    updated(changedProperties) {
        // React will efficiently update the component when the same ReactDOM.render() is called
        // on the existing container, keeping the internal state intact.
        if (changedProperties.has("props")) {
            this.renderReactComponent();
        }
    }

    renderReactComponent() {
        if (this.reactComponent && this.reactRoot) {
            ReactDOM.render(
                React.createElement(this.reactComponent, this.props),
                this.reactRoot
            );
        }
    }

    render() {
        console.log("render react");
        return html`<div id="react-root"></div>`;
    }
}

customElements.define("react-wrapper", ReactWrapper);
