import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators'
import { styleMap } from 'lit/directives/style-map'

import { px } from './utils'

export type MiniNodeType = {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class MiniNode extends LitElement {
  @property({ type: Number }) left = 0
  @property({ type: Number }) top = 0
  @property({ type: Number }) width = 0
  @property({ type: Number }) height = 0

  static styles = css`
    .mini-node {
      position: absolute;
      background: rgba(110, 136, 255, 0.8);
      border: 1px solid rgb(192 206 212 / 60%);
    }
  `

  get styles() {
    return {
      left: px(this.left),
      top: px(this.top),
      width: px(this.width),
      height: px(this.height)
    }
  }

  render() {
    return html`
      <div class="mini-node" style=${styleMap(this.styles)}></div>
    `
  }
}

customElements.define('mini-node', MiniNode)
