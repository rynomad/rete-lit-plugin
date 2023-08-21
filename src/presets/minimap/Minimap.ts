/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/naming-convention */
import { deepEqual } from 'fast-equals'
import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators'

import { MiniNodeType } from './MiniNode'
import { px } from './utils'

@customElement('minimap-component')
export class Minimap extends LitElement {
    @property({ type: Number }) size = 200
    @property({ type: Number }) ratio = 1
    @property({
      type: Array,
      hasChanged: (newVal: MiniNodeType[], oldVal: MiniNodeType[]) => {
        return !deepEqual(newVal, oldVal)
      }
    })
      nodes: MiniNodeType[] | undefined
    @property({ type: Object }) viewport: any
    @property({ type: Function }) reTranslate = () => {
      throw new Error('reTranslate not set properly')
    }
    @property({ type: Function }) point = (_x: number, _y: number) => {
      throw new Error('point not defined Properly')
    }
    @property({ type: Number }) seed: number | undefined

    @query('.minimap') container: HTMLElement | undefined

    static styles = css`
        .minimap {
            position: absolute;
            right: 24px;
            bottom: 24px;
            background: rgba(229, 234, 239, 0.65);
            padding: 20px;
            overflow: hidden;
            border: 1px solid #b1b7ff;
            border-radius: 8px;
            box-sizing: border-box;
        }
    `

    render() {
      return html`
            <div
                class="minimap"
                style="width: ${px(this.size * this.ratio)}; height: ${px(
  this.size
)}"
                @pointerdown="${this.stopEvent}"
                @dblclick="${this.dblclick}"
                data-testid="minimap"
            >
                ${this.nodes?.map(
    (node) => html`
                        <mini-node
                            .left="${this.scale(node.left)}"
                            .top="${this.scale(node.top)}"
                            .width="${this.scale(node.width)}"
                            .height="${this.scale(node.height)}"
                        ></mini-node>
                    `
  )}
                <mini-viewport
                    .left="${this.viewport.left}"
                    .top="${this.viewport.top}"
                    .width="${this.viewport.width}"
                    .height="${this.viewport.height}"
                    .containerWidth="${this.container &&
                    this.container.clientWidth}"
                    .reTranslate="${this.reTranslate}"
                ></mini-viewport>
            </div>
        `
    }

    stopEvent(e: Event) {
      e.stopPropagation()
      e.preventDefault()
    }

    dblclick(e: MouseEvent) {
      if (!this.container) return
      const box = this.container.getBoundingClientRect()
      const x = (e.clientX - box.left) / (this.size * this.ratio)
      const y = (e.clientY - box.top) / (this.size * this.ratio)

      this.point?.(x, y)
    }

    scale(value: number) {
      if (!this.container) return 0

      return value * this.container.clientWidth
    }
}
