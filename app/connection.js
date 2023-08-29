import { css, LitElement, html } from "https://esm.sh/lit";

export class Connection extends LitElement {
    static styles = css`
        svg {
            overflow: visible !important;
            position: absolute;
            pointer-events: none;
            width: 9999px;
            height: 9999px;
        }
        path {
            fill: none;
            stroke-width: 5px;
            stroke: steelblue;
            pointer-events: auto;
        }
    `;

    static properties = {
        data: { type: Object },
        start: { type: Object },
        end: { type: Object },
        curvature: { type: Number },
    };

    constructor() {
        super();
        this.data = {};
        this.start = {};
        this.end = {};
        this.curvature = 0.5; // Default curvature value
    }

    classicConnectionPath(points, curvature) {
        let [{ x: x1, y: y1 }, { x: x2, y: y2 }] = [this.start, this.end];

        x1 -= 12;
        x2 += 12;
        y1 += 12;
        y2 -= 12;

        const horizontal = Math.abs(x1 - x2);

        if (y1 === y2) {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        const hy1 =
            y1 + Math.max(horizontal / 2, Math.abs(y2 - y1)) * this.curvature;
        const hy2 =
            y2 - Math.max(horizontal / 2, Math.abs(y2 - y1)) * this.curvature;

        return `M ${x1} ${y1} C ${x1} ${hy1} ${x2} ${hy2} ${x2} ${y2}`;
    }

    render() {
        const path = this.classicConnectionPath();
        return html`
            <svg data-testid="connection">
                <path d=${path}></path>
            </svg>
        `;
    }
}

customElements.define("custom-connection-component", Connection);
