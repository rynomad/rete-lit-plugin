import { LitElement } from 'lit';
export declare class MiniViewport extends LitElement {
    left: number;
    top: number;
    width: number;
    height: number;
    containerWidth: number;
    reTranslate: (_x: any, _y: any) => never;
    drag: {
        start(e: {
            pageX: number;
            pageY: number;
        }): void;
    };
    scale(v: number): number;
    invert(v: number): number;
    onDrag(dx: number, dy: number): void;
    get styles(): {
        left: string;
        top: string;
        width: string;
        height: string;
    };
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
//# sourceMappingURL=MiniViewport.d.ts.map