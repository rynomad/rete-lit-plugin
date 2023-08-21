/* eslint-disable @typescript-eslint/naming-convention */
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

import { Pin } from './types'

@customElement('pins-component')
export class Pins extends LitElement {
  @property({ type: Array }) pins: Pin[] = []
  @property({ type: Function }) menu = (_id: string) => {throw new Error('menu not set properly')}
  @property({ type: Function }) reTranslate = (_id: string, _dx: number, _dy: number) => {throw new Error('reTranslate not set properly')}
  @property({ type: Function }) down = (_id: string) => {throw new Error('down not set properly')}
  @property({ type: Function }) getPointer = () => {throw new Error('getPointer not set properly')}

  static styles = css`
    :host {
      display: block;
    }
  `

  render() {
    return html`
      ${this.pins.map(
    pin => html`
          <pin-component
            .position=${pin.position}
            .selected=${pin.selected}
            .getPointer=${this.getPointer}
            @menu=${() => this.menu(pin.id)}
            @translate=${(e: CustomEvent) => this.reTranslate(pin.id, e.detail.dx, e.detail.dy)}
            @down=${() => this.down(pin.id)}
          ></pin-component>
        `
  )}
    `
  }
}
