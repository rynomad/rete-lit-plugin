import { html, css, LitElement } from "https://esm.sh/lit@2.0.2";
import { Subject } from "https://esm.sh/rxjs@7.3.0";
import { sanitizeAndRenderYaml } from "./util.js";
import { PropagationStopper } from "./mixins.js";
import "./tabs.js";

import "https://esm.sh/@dile/dile-pages/dile-pages.js";
import "https://esm.sh/@dile/dile-tabs/dile-tabs.js";
class MySidebar extends PropagationStopper(LitElement) {
    static get properties() {
        return {
            subject: { type: Object },
            data: { type: Object },
        };
    }

    static styles = css`
        :host {
            display: block;
            position: absolute;
            right: 0;
            top: 0;
            width: 30rem;
            height: 100%;
            z-index: 999;
            background-color: #fff;
            box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
            overflow-y: auto;
        }

        md-tabs {
            height: 3rem;
        }
        .content {
            padding: 1rem;
            height: 100%;
        }
    `;

    constructor() {
        super();
        this.subject = new Subject();
        this.data = {};

        // Subscribe to the subject to update the `data` property whenever new data is emitted.
        this.subject.subscribe(({ data }) => {
            // alert("new data");
            this.data = data;
            this.requestUpdate(); // Trigger a re-render.
        });
    }

    async connectedCallback() {
        super.connectedCallback();
    }

    get globals() {
        return (
            Object.values(this.data?.inputs || {})?.filter(
                (value) => value.global
            ) || []
        );
    }

    get config() {
        return (
            Object.values(this.data?.inputs || {})?.filter(
                (value) => !value.global && value.label !== "inputs"
            ) || []
        );
    }

    get inputs() {
        const inputs = this.data?.upstream?.getValue() || [];
        console.log("inputs", inputs);
        return inputs;
    }

    get outputs() {
        return this.data?.downstream?.getValue() || [];
    }

    get tabs() {
        return ["Config", "Global", "Debug"];
    }

    get openTab() {
        return this.tabs[this.activeTabIndex];
    }

    get configOpen() {
        return this.activeTabIndex === 0;
    }

    get globalOpen() {
        return this.activeTabIndex === 1;
    }

    get debugOpen() {
        return this.activeTabIndex === 2;
    }

    render() {
        return html`
            <div class="content">
                <!-- Render the data as JSON for demonstration -->
                <dile-tabs
                    id="select2"
                    attrForSelected="name"
                    selectorId="selector"
                    selected="${this.openTab}">
                    ${this.tabs.map(
                        (label, index) => html`
                            <dile-tab
                                icon="label_important"
                                name=${label}
                                ${this.activeTabIndex === index ? "active" : ""}
                                >${label}</dile-tab
                            >
                        `
                    )}
                </dile-tabs>
                <dile-pages
                    attrForSelected="name"
                    selectorId="selector"
                    selected="${this.openTab}">
                    <div name="Config">
                        ${this.config?.map(
                            (entry) =>
                                html`<rjsf-component
                                    .props=${entry}></rjsf-component>`
                        )}
                    </div>
                    <div name="Global">
                        ${this.globals?.map(
                            (entry) =>
                                html`<rjsf-component
                                    .props=${entry}></rjsf-component>`
                        )}
                    </div>
                    <div name="Debug">
                        <transformer-debug-card
                            .inputs=${this.inputs}
                            .outputs=${this.outputs}></transformer-debug-card>
                    </div>
                </dile-pages>
            </div>
        `;
    }
}

customElements.define("canvas-sidebar", MySidebar);
