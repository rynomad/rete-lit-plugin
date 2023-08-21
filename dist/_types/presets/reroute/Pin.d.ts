import { LitElement } from 'lit';
export declare type PinType = {
    position: {
        x: number;
        y: number;
    };
    selected: boolean;
};
export declare class Pin extends LitElement {
    position: {
        x: number;
        y: number;
    };
    selected: boolean;
    getPointer: any;
    drag: any;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    get styles(): {
        position: string;
        top: string;
        left: string;
    };
    onDrag(dx: number, dy: number): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
//# sourceMappingURL=Pin.d.ts.map