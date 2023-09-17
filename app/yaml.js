import { html, css, LitElement } from "https://esm.sh/lit@2.0.2";
import { Subject } from "https://esm.sh/rxjs@7.3.0";
import { load } from "https://esm.sh/js-yaml@4.1.0";
import Prism from "https://esm.sh/prismjs@1.24.1/components/prism-core.js";
import "https://esm.sh/prismjs@1.24.1/components/prism-json.js";
import { unsafeHTML } from "https://esm.sh/lit/directives/unsafe-html.js";
import marked from "https://esm.sh/marked@2.0.7";

class YamlRenderer extends LitElement {
    static get properties() {
        return {
            data: { type: Object },
            preamble: { type: String },
        };
    }

    static styles = css`
        pre {
            background-color: #f5f5f5;
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
        }
    `;

    constructor() {
        super();
        this.data = {};
        this.data.contextYaml$ = new Subject();

        // Subscribe to the subject to update the `data` property whenever new data is emitted.
        this.subscription = this.data.contextYaml$.subscribe((yaml) => {
            this.yaml = yaml;
            this.requestUpdate(); // Trigger a re-render.
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up the subscription when the component is removed
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    render() {
        // Parse the YAML and highlight it using Prism.js
        let yamlObj = {};
        let yamlStr = "";
        let highlightedYaml = "";
        if (this.yaml) {
            yamlObj = load(this.yaml);
            yamlStr = JSON.stringify(yamlObj, null, 2);
            highlightedYaml = Prism.highlight(
                yamlStr,
                Prism.languages.json,
                "json"
            );
        }

        // Render preamble as markdown if it exists
        let preambleHtml = "";
        if (this.preamble) {
            preambleHtml = marked(this.preamble);
        }

        // Use unsafeHTML to render the highlightedYaml as HTML
        return html`<div>${unsafeHTML(preambleHtml)}</div>
            <pre>${unsafeHTML(highlightedYaml)}</pre>`;
    }
}

customElements.define("yaml-renderer", YamlRenderer);
