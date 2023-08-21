import { LitElement } from 'lit';
export declare class RefElement extends LitElement {
    data: {};
    emit: (_payload: Object) => never;
    element: HTMLElement | undefined;
    originalElementsFromPoint: (x: number, y: number) => Element[];
    updated(): void;
    disconnectedCallback(): void;
    handlePointerDown(): void;
    handlePointerUp(): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
//# sourceMappingURL=Ref.d.ts.map