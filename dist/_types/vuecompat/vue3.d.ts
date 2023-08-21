import { LitElement } from 'lit';
declare type Instance<P> = {
    element: LitElement;
    payload: P;
};
export declare class ReteComponent<P extends object> extends LitElement {
    payload: P;
    onRendered: any;
    constructor(payload: P, onRendered: any);
    updated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare function create<P extends object>(element: HTMLElement, component: any, payload: P, onRendered: any): Instance<P>;
export declare function update<P extends object>(instance: Instance<P>, payload: P): void;
export declare function destroy(instance: Instance<unknown>): void;
export {};
//# sourceMappingURL=vue3.d.ts.map