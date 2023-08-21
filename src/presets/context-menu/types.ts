import { RenderSignal } from '../../types'

export type Item = {
  label: string
  key: string
  handler(e: Event): void
  subitems?: Item[]
}

export type ContextMenuRender =
  | RenderSignal<'contextmenu', { items: Item[], onHide(): void, searchBar?: boolean }>
