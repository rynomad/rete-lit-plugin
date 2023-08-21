import './Block';
import { LitElement } from 'lit';
import { Item as ItemType } from '../types';
export declare class Item extends LitElement {
    subitems: ItemType[];
    delay: number;
    visibleSubitems: boolean;
    hide: any;
    constructor();
    hideSubitems(): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult[];
}
//# sourceMappingURL=Item.d.ts.map