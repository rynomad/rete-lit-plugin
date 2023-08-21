import './MiniNode'
import './MiniViewport'

import { BaseSchemes } from 'rete'

import { RenderPreset } from '../types'
import { Minimap } from './Minimap'
import { MinimapRender } from './types'

export function setup<Schemes extends BaseSchemes, K extends MinimapRender>(props?: { size?: number }): RenderPreset<Schemes, K> {
  return {
    update(context) {
      if (context.data.type === 'minimap') {
        return {
          nodes: context.data.nodes,
          size: props?.size || 200,
          ratio: context.data.ratio,
          viewport: context.data.viewport,
          reTranslate: context.data.translate,
          point: context.data.point
        }
      }
    },
    render(context) {
      if (context.data.type === 'minimap') {
        return {
          component: Minimap,
          props: {
            nodes: context.data.nodes,
            size: props?.size || 200,
            ratio: context.data.ratio,
            viewport: context.data.viewport,
            reTranslate: context.data.translate,
            point: context.data.point
          }
        }
      }
    }
  }
}
