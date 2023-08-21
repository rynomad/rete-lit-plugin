import { RenderSignal } from '../../types';
export declare type Item = {
    label: string;
    key: string;
    handler(e: Event): void;
    subitems?: Item[];
};
export declare type ContextMenuRender = RenderSignal<'contextmenu', {
    items: Item[];
    onHide(): void;
    searchBar?: boolean;
}>;
//# sourceMappingURL=types.d.ts.map