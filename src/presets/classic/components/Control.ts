/* eslint-disable @typescript-eslint/ban-ts-comment */
import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators'
import { ClassicPreset } from 'rete'

import vars from '../vars'

export class Control<T extends 'text' | 'number'> extends LitElement {
  @property({ type: ClassicPreset.InputControl }) data: ClassicPreset.InputControl<T> | undefined
  static styles = [vars, css`
    input {
      width: 100%;
      border-radius: 30px;
      background-color: white;
      padding: 2px 6px;
      border: 1px solid #999;
      font-size: 110%;
      box-sizing: border-box;
    }
  `]

  render() {
    return html`
      <input
        type="${this.data?.type}"
        .value="${this.data?.value}"
        ?readonly="${this.data?.readonly}"
        @input="${this.change}"
        @pointerdown="${this.stopEvent}"
      />
    `
  }

  change(e: Event) {
    const val = this.data?.type === 'number'
      ? +(e.target as HTMLInputElement)?.value
      : (e.target as HTMLInputElement)?.value

    // @ts-ignore
    this.data?.setValue(val)
  }

  stopEvent(e: Event) {
    e.stopPropagation()
  }
}

customElements.define('control-component', Control)
