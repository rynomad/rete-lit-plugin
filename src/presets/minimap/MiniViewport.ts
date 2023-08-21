import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators'

import { useDrag } from '../../shared/drag'
import { px } from './utils'

export class MiniViewport extends LitElement {
  @property({ type: Number }) left = 0
  @property({ type: Number }) top = 0
  @property({ type: Number }) width = 0
  @property({ type: Number }) height = 0
  @property({ type: Number }) containerWidth = 0
  // eslint-disable-next-line @typescript-eslint/naming-convention
  @property({ type: Function }) reTranslate = (_x: any, _y: any) => { throw new Error('TRANSLATE NOT SET PROPERLY IN MiniViewport')}

  drag = useDrag(this.onDrag, e => ({ x: e.pageX, y: e.pageY }))

  scale(v: number) {
    return v * this.containerWidth
  }

  invert(v: number) {
    return v / this.containerWidth
  }

  onDrag(dx: number, dy: number) {
    this.reTranslate(this.invert(-dx), this.invert(-dy))
  }

  get styles() {
    return {
      left: px(this.scale(this.left)),
      top: px(this.scale(this.top)),
      width: px(this.scale(this.width)),
      height: px(this.scale(this.height))
    }
  }

  render() {
    return html`
      <div
        class="mini-viewport"
        @pointerdown=${this.drag.start}
        style=${this.styles}
        data-testid="minimap-viewport"
      ></div>
    `
  }

  static styles = css`
    .mini-viewport {
      position: absolute;
      background: rgba(255, 251, 128, 0.32);
      border: 1px solid #ffe52b;
    }
  `
}

customElements.define('mini-viewport', MiniViewport)
