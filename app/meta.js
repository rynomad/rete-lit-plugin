import { LitElement, html, css } from "https://esm.sh/lit@2.0.2";
import { BehaviorSubject, filter } from "https://esm.sh/rxjs@7.4.0";

export class MetadataComponent extends LitElement {
    static get properties() {
        return {
            subject: { type: Object },
        };
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .text-input {
                border: none;
                border-bottom: 1px solid #ccc;
                margin: 10px;
                font-size: 1.5em;
                text-align: center;
                outline: none;
            }
            .description {
                font-size: 1em;
            }
        `;
    }

    constructor() {
        super();
        this.subject = new BehaviorSubject({ name: "", description: "" });
        this.subscription = null;
        this.deferredUpdate = null;
        this.currentName = "";
        this.currentDescription = "";
    }

    connectedCallback() {
        super.connectedCallback();
        this.subscribeToSubject();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribeFromSubject();
    }

    updated(changedProperties) {
        if (changedProperties.has("subject")) {
            this.unsubscribeFromSubject();
            this.subscribeToSubject();
        }
    }

    subscribeToSubject() {
        if (this.subject) {
            this.subscription = this.subject
                .pipe(filter((value) => value))
                .subscribe(({ name, description }) => {
                    const currentName =
                        this.shadowRoot.getElementById("name")?.innerText;
                    const currentDescription =
                        this.shadowRoot.getElementById(
                            "description"
                        )?.innerText;

                    if (name !== currentName) {
                        this.requestUpdate("name", name);
                    }

                    if (description !== currentDescription) {
                        this.requestUpdate("description", description);
                    }
                });
        }
    }

    unsubscribeFromSubject() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onInput(event) {
        if (event.target.id === "name") {
            this.currentName = event.target.innerText;
        } else {
            this.currentDescription = event.target.innerText;
        }
    }

    onFocus() {
        if (this.deferredUpdate) {
            clearTimeout(this.deferredUpdate);
            this.deferredUpdate = null;
        }
    }

    onBlur(event) {
        this.deferredUpdate = setTimeout(() => {
            this.subject.next({
                name:
                    this.shadowRoot.getElementById("name")?.innerText ||
                    "New Magic Node",
                description:
                    this.shadowRoot.getElementById("description")?.innerText ||
                    "",
            });
        }, 50);
    }

    updateName() {
        const currentVal = this.subject.getValue();
        this.subject.next({
            name: this.currentName,
            description: currentVal.description,
        });
    }

    updateDescription() {
        const currentVal = this.subject.getValue();
        this.subject.next({
            name: currentVal.name,
            description: this.currentDescription,
        });
    }

    render() {
        const { name, description } = this.subject.getValue() || {};
        return html`
            <div
                id="name"
                class="text-input"
                contenteditable
                @input=${this.onInput}
                @focus=${this.onFocus}
                @blur=${this.onBlur}>
                ${name}
            </div>
            <div
                id="description"
                class="text-input description"
                contenteditable
                @input=${this.onInput}
                @focus=${this.onFocus}
                @blur=${this.onBlur}>
                ${description}
            </div>
        `;
    }
}

// Define the custom element
customElements.define("node-meta-component", MetadataComponent);
