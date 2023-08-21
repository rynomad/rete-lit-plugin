import { LitElement } from 'lit';
import { MiniNodeType } from './MiniNode';
export declare class Minimap extends LitElement {
    size: number;
    ratio: number;
    nodes: MiniNodeType[] | undefined;
    viewport: any;
    reTranslate: () => never;
    point: (_x: number, _y: number) => never;
    seed: number | undefined;
    container: HTMLElement | undefined;
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    stopEvent(e: Event): void;
    dblclick(e: MouseEvent): void;
    scale(value: number): number;
}
//# sourceMappingURL=Minimap.d.ts.map