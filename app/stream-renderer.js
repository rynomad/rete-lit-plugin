import { LitElement, css, html } from "https://esm.sh/lit";
import { filter } from "https://esm.sh/rxjs@7.3.0";

import { unsafeHTML } from "https://esm.sh/lit/directives/unsafe-html";

import { marked } from "https://esm.sh/marked";
const StreamRenderer = class extends LitElement {
    static styles = css`
        :host {
            display: block;
            // padding: 16px;
            // color: var(--stream-renderer-text-color, black);

            // user-select: text;
            // display: block;
            background-color: #f5f5f5;
            border-radius: 10px;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            margin: 15px;
            // margin: 15px;
            // padding: 15px;
            // max-width: 80vw;
            // cursor: auto;
        }

        .content {
            color: var(--stream-renderer-text-color, black);
        }

        // p:last-of-type {
        //     margin-bottom: -45px;
        // }

        // p:first-of-type {
        //     margin-top: -25px;
        // }
        .content.show {
            padding: 15px;
            // white-space: pre-wrap;
            user-select: text;
        }
    `;

    static properties = {
        stream: { type: Object },
    };

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.stream?.pipe(filter((e) => e)).subscribe((content) => {
            console.log("stream content", content);
            if (typeof content === "string") {
                this.renderContent(content);
            } else content.subscribe(this.renderContent.bind(this));
        });
    }

    renderContent(content) {
        this.content = content ? marked(content.trim()) : "";
        this.requestUpdate();
    }

    render() {
        return html`<div class="content ${this.content ? "show" : "hide"}">
            ${unsafeHTML(this.content)}
        </div> `;
    }
};

customElements.define("stream-renderer", StreamRenderer);
