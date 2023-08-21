import { LitElement } from 'lit';
import { ClassicPreset } from 'rete';
import { BehaviorSubject, Subscription } from 'rxjs';
declare type IODefinition = {
    label: string;
    schema?: object;
    subject?: BehaviorSubject<any>;
    validate?: (outputDef: IODefinition) => boolean;
    subscription?: Subscription;
    socket?: ClassicPreset.Socket;
};
declare type IntermediateDefinition = {
    label: string;
    operator: any;
};
declare type ContextData = {
    id: string;
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
};
export declare class Transformer extends LitElement {
    private editor;
    static socket: ClassicPreset.Socket;
    static inputs: IODefinition[];
    static outputs: IODefinition[];
    static intermediates: IntermediateDefinition[];
    static styles: import("lit").CSSResult;
    nodeId: string;
    selected: boolean;
    inputs: {
        [label: string]: IODefinition;
    };
    outputs: {
        [label: string]: IODefinition;
    };
    intermediates: {
        [label: string]: IntermediateDefinition;
    };
    constructor(editor: any);
    processIO(definitions: IODefinition[], ioObject: {
        [label: string]: IODefinition;
    }): void;
    createValidateFunction(inputDef: IODefinition): (outputDef: IODefinition) => boolean;
    processIntermediates(list: IntermediateDefinition[]): void;
    transform(): void;
    render(): import("lit-html").TemplateResult<1>;
    subscribe(context: ContextData): void;
    unsubscribe(context: ContextData): void;
}
export {};
//# sourceMappingURL=Transformer.d.ts.map