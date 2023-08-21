import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

@customElement('connection-component')
export class Connection extends LitElement {
  @property({ type: Object }) data = {}
  @property({ type: Object }) start = {}
  @property({ type: Object }) end = {}
  @property({ type: String }) path = ''

  static styles = css`
    svg {
      overflow: visible !important;
      position: absolute;
      pointer-events: none;
      width: 9999px;
      height: 9999px;
    }
    path {
      fill: none;
      stroke-width: 5px;
      stroke: steelblue;
      pointer-events: auto;
    }
  `

  render() {
    return html`
      <svg data-testid="connection">
        <path d=${this.path}></path>
      </svg>
    `
  }
}
