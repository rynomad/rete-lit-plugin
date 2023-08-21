import { LitElement } from 'lit';
export declare class ConnectionWrapper extends LitElement {
    component: any;
    data: any;
    start: any;
    end: any;
    path: Function;
    observedStart: {
        x: number;
        y: number;
    };
    observedEnd: {
        x: number;
        y: number;
    };
    observedPath: string;
    onDestroy: Function | null;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    initializeWatchers(): void;
    fetchPath(): Promise<void>;
    get startPosition(): any;
    get endPosition(): any;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=ConnectionWrapper.d.ts.map