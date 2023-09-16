import { html, css, LitElement } from "https://esm.sh/lit";
import { Subject } from "https://esm.sh/rxjs";
import { PropagationStopper } from "./mixins.js";
class ChatInput extends PropagationStopper(LitElement) {
    static get properties() {
        return {
            subject: {
                type: Object,
            },
            message: {
                type: String,
            },
            handleFocus: {
                type: Function,
            },
            handleBlur: {
                type: Function,
            },
        };
    }
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            padding: 10px;
        }

        .editable {
            border: 1px solid #ccc;
            padding: 10px;
            min-height: 4rem;
            background-color: white;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            flex-grow: 1;
            cursor: text;
        }

        button {
            height: auto;
            min-height: 4rem; /* same as .editable for visual consistency */
            width: 40px;
            background: #0099cc;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        button span {
            font-size: 3em;
            transform: scale(0.5, 1.5);
        }
    `;

    constructor() {
        super();
        this.messageSubject = new Subject();
        this.message = "";
    }

    handleInputChange(e) {
        const editableDiv = this.shadowRoot.querySelector(".editable");
        const message = editableDiv.innerText.trim();

        const button = this.shadowRoot.querySelector("button");
        if (message !== "") {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "");
        }
    }

    sendMessage() {
        const editableDiv = this.shadowRoot.querySelector(".editable");
        const message = editableDiv.innerText.trim();

        if (message !== "") {
            this.subject?.next({ message });
        }
    }

    handleKeyPress(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            console.log("enter");
            e.preventDefault();
            this.sendMessage();
        }
    }

    render() {
        return html`
            <div
                class="editable"
                contenteditable
                role="textbox"
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
                @input=${this.handleInputChange}
                @keydown=${this.handleKeyPress}></div>
            <button
                @click=${this.sendMessage}
                <span>&gt;</span>
            </button>
        `;
    }
}

customElements.define("chat-input", ChatInput);
