import { LitElement } from 'lit';
export declare class VueCompat extends LitElement {
    static styles: import("lit").CSSResult;
    payload: any;
    component: any;
    onRendered: any;
    constructor(element: any, component: any, payload: any, onRendered: any);
    render(): import("lit-html").TemplateResult<1>;
    updated(): void;
}
export declare function create(element: any, component: any, payload: any, onRendered: any): VueCompat;
export declare function update(app: VueCompat, payload: any): void;
export declare function destroy(app: VueCompat): void;
//# sourceMappingURL=vue2.d.ts.map