import { LitElement } from 'lit';
export declare type MiniNodeType = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export declare class MiniNode extends LitElement {
    left: number;
    top: number;
    width: number;
    height: number;
    static styles: import("lit").CSSResult;
    get styles(): {
        left: string;
        top: string;
        width: string;
        height: string;
    };
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=MiniNode.d.ts.map