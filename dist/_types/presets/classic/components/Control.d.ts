import { LitElement } from 'lit';
import { ClassicPreset } from 'rete';
export declare class Control<T extends 'text' | 'number'> extends LitElement {
    data: ClassicPreset.InputControl<T> | undefined;
    static styles: import("lit").CSSResult[];
    render(): import("lit-html").TemplateResult<1>;
    change(e: Event): void;
    stopEvent(e: Event): void;
}
//# sourceMappingURL=Control.d.ts.map