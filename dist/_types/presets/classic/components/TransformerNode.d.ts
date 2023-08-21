import { LitElement } from 'lit';
import { Transformer } from './Transformer';
export declare class TransformerNode extends LitElement {
    get data(): Transformer | undefined;
    set data(val: Transformer | undefined);
    emit: () => never;
    seed: string;
    private _data;
    static styles: import("lit").CSSResult[];
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=TransformerNode.d.ts.map