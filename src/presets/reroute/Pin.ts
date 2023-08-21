import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

import { useDrag } from '../../shared/drag'

const pinSize = 20

export type PinType = {
  position: {
    x: number,
    y: number
  },
  selected: boolean
}

@customElement('pin-component')
export class Pin extends LitElement {
  @property({ type: Object }) position = { x: 0, y: 0 }
  @property({ type: Boolean }) selected = false
  @property({ type: Function }) getPointer: any

  drag: any

  constructor() {
    super()
    this.drag = useDrag(this.onDrag, this.getPointer)
  }

  connectedCallback() {
    super.connectedCallback()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
  }

  get styles() {
    const { x, y } = this.position

    return {
      position: 'absolute',
      top: `${y - pinSize / 2}px`,
      left: `${x - pinSize / 2}px`
    }
  }

  onDrag(dx: number, dy: number) {
    this.dispatchEvent(new CustomEvent('translate', { detail: { dx, dy } }))
  }

  render() {
    return html`
      <div
        class="pin ${this.selected ? 'selected' : ''}"
        style="${this.styles}"
        @pointerdown="${(e: Event) => { this.drag.start(e); this.dispatchEvent(new CustomEvent('down')) }}"
        @contextmenu="${(e: Event) => { e.preventDefault(); this.dispatchEvent(new CustomEvent('menu')) }}"
        data-testid="pin"
      ></div>
    `
  }

  static styles = css`
    $size: 20px;

    .pin {
      width: $size;
      height: $size;
      box-sizing: border-box;
      background: steelblue;
      border: 2px solid white;
      border-radius: $size;

      &.selected {
        background: #ffd92c;
      }
    }
  `
}
