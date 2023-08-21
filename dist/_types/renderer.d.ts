import { LitElement } from 'lit';
declare type Instance<P> = {
    app: LitElement;
    payload: P;
};
export declare function create<P extends Record<string, any>>(element: Element, component: any, payload: P, onRendered: any): Instance<P>;
export declare function update<P extends object>(instance: Instance<P>, payload: P): void;
export declare function destroy(instance: Instance<unknown>): void;
export declare type Renderer<I> = {
    get(element: Element): I | undefined;
    mount(element: Element, litComponent: any, payload: object, onRendered: any): I;
    update(app: I, payload: object): void;
    unmount(element: Element): void;
};
export declare function getRenderer(): Renderer<Instance<object>>;
export {};
//# sourceMappingURL=renderer.d.ts.map