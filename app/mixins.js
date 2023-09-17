import { dedupeMixin } from "https://esm.sh/@open-wc/dedupe-mixin";
import { css, LitElement, html } from "https://esm.sh/lit";

export const PropagationStopper = dedupeMixin(
    (Base, events = ["pointerdown", "wheel", "dblclick"]) =>
        class Overriden extends Base {
            static styles = [
                css`
                    :host {
                        user-select: text;
                    }
                `,

                ...[Base.styles].flat(),
            ];
            connectedCallback() {
                super.connectedCallback();

                events.forEach((name) =>
                    this.addEventListener(name, this.stopPropagation, {
                        capture: true, // Capture the event before it reaches other handlers
                    })
                );
            }

            // Define the event handler
            stopPropagation(event) {
                const rect = this.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(this);

                // Fetch and parse the margins
                const marginLeft = parseFloat(computedStyle.marginLeft);
                const marginTop = parseFloat(computedStyle.marginTop);
                const marginRight = parseFloat(computedStyle.marginRight);
                const marginBottom = parseFloat(computedStyle.marginBottom);

                // Calculate the adjusted boundaries without the margins
                const adjustedLeft = rect.left + marginLeft;
                const adjustedRight = rect.right - marginRight;
                const adjustedTop = rect.top + marginTop;
                const adjustedBottom = rect.bottom - marginBottom;

                // Check if the event's coordinates are within the adjusted rectangle
                if (
                    event.clientX >= adjustedLeft &&
                    event.clientX <= adjustedRight &&
                    event.clientY >= adjustedTop &&
                    event.clientY <= adjustedBottom
                ) {
                    // Prevent other handlers from stopping the default behavior
                    event.stopPropagation();
                }
            }

            // Don't forget to clean up the event listener when the element is disconnected
            disconnectedCallback() {
                events.forEach((name) =>
                    this.removeEventListener(name, this.stopPropagation, {
                        capture: true,
                    })
                );
                super.disconnectedCallback();
            }
        }
);

const PropStopper = PropagationStopper(
    class extends LitElement {
        render() {
            return html`<slot></slot>`;
        }
    }
);

customElements.define(`propaagation-stopper`, PropStopper);

export const CardStyleMixin = dedupeMixin(
    (Base) =>
        class extends Base {
            static properties = {
                ...(Base.properties || {}),
                isOpen: { type: Boolean, reflect: true, attribute: "is-open" },
                halfCard: {
                    type: String,
                    reflect: true,
                    attribute: "half-card",
                },
            };

            static styles = [
                css`
                    :host {
                        display: block;
                        background-color: #f5f5f5;
                        border-radius: 10px;
                        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
                        margin: 15px;
                        padding: 15px;
                        overflow: auto;
                        transition: max-height 0.5s ease-out,
                            margin 0.5s ease-out, padding 0.5s ease-out;
                        max-width: 80vw;
                        cursor: auto;
                    }

                    :host([is-open="false"]) {
                        max-height: 0;
                        margin-top: 0;
                        margin-bottom: 0;
                        padding: 0;
                    }

                    :host([half-card="top"]) {
                        border-top-left-radius: 0;
                        border-top-right-radius: 0;
                        margin-top: 0;
                    }

                    :host([half-card="bottom"]) {
                        border-bottom-left-radius: 0;
                        border-bottom-right-radius: 0;
                        margin-bottom: 0;
                    }
                `,
                ...[Base.styles].flat(),
            ];

            constructor() {
                super();
            }

            async toggle() {
                this.isOpen = !this.isOpen;
                await this.updateComplete; // Wait for the component to update

                return new Promise((resolve) => {
                    setTimeout(() => resolve(), 500); // Match the transition time
                });
            }
        }
);
