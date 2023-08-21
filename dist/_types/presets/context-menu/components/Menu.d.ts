import { LitElement } from 'lit';
import { Item } from '../types';
export declare class Menu extends LitElement {
    items: Item[];
    delay: number;
    searchBar: boolean;
    onHide: () => void;
    seed: string;
    filter: string;
    hide: any;
    constructor();
    getItems(): Item[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult[];
}
//# sourceMappingURL=Menu.d.ts.map