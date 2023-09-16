import { html, css, LitElement } from "https://esm.sh/lit@2.0.2";

class TabContainer extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid #ccc;
        }
        .tab {
            cursor: pointer;
            padding: 10px;
            margin-right: 10px;
            border-bottom: 3px solid transparent;
        }
        .tab.active {
            border-bottom: 3px solid blue;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    `;

    static properties = {
        activeTab: { type: Number },
    };

    constructor() {
        super();
        this.activeTab = 0;
        this.tabs = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("slotchange", this.updateTabs);
    }

    updateTabs = () => {
        this.tabs = Array.from(this.children).map((el) =>
            el.getAttribute("label")
        );
        this.requestUpdate();
    };

    setActiveTab(index) {
        this.activeTab = index;
    }

    render() {
        return html`
            <div class="tabs">
                ${this.tabs.map(
                    (label, index) => html`
                        <div
                            class=${this.activeTab === index
                                ? "tab active"
                                : "tab"}
                            @click=${() => this.setActiveTab(index)}>
                            ${label}
                        </div>
                    `
                )}
            </div>
            ${Array.from(this.children).map(
                (child, index) => html`
                    <div
                        class=${this.activeTab === index
                            ? "tab-content active"
                            : "tab-content"}>
                        ${child}
                    </div>
                `
            )}
        `;
    }
}

customElements.define("tab-container", TabContainer);
