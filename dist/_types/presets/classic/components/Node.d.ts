import { LitElement } from 'lit';
import { ClassicPreset } from 'rete';
export declare class Node extends LitElement {
    data: ClassicPreset.Node | undefined;
    emit: () => never;
    seed: string;
    nodeStyles(): string;
    inputs(): any;
    controls(): any;
    outputs(): any;
    static styles: import("lit").CSSResult[];
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=Node.d.ts.map