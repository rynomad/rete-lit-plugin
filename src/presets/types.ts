import { BaseSchemes } from 'rete'

import { LitPlugin } from '..'

type ComponentProps = Record<string, any> | undefined | void | null
type RenderResult = { component: any, props: ComponentProps } | undefined | void | null

export type RenderPreset<Schemes extends BaseSchemes, T> = {
  attach?: (plugin: LitPlugin<Schemes, T>) => void
  update: (context: Extract<T, { type: 'render' }>, plugin: LitPlugin<Schemes, T>) => ComponentProps
  render: (context: Extract<T, { type: 'render' }>, plugin: LitPlugin<Schemes, T>) => RenderResult
}
