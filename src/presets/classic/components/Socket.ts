import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'
import { ClassicPreset } from 'rete'

import vars from '../vars'

@customElement('socket-component')
export class Socket extends LitElement {
    @property({ type: ClassicPreset.Socket }) data:
        | ClassicPreset.Socket
        | undefined

    static styles = [
      vars,
      css`
            :host {
                display: inline-block;
                cursor: pointer;
                border: 1px solid white;
                border-radius: calc(var(--socket-size) / 2);
                width: var(--socket-size);
                height: var(--socket-size);
                margin: var(--socket-margin);
                vertical-align: middle;
                background: var(--socket-color);
                z-index: 2;
                box-sizing: border-box;
            }
            :host(:hover) {
                border-width: 4px;
            }
            :host(.multiple) {
                border-color: yellow;
            }
            :host(.output) {
                margin-right: calc(var(--socket-size) / -2);
            }
            :host(.input) {
                margin-left: calc(var(--socket-size) / -2);
            }
        `
    ]

    // Define the click handler function
    handleClick() {
      // eslint-disable-next-line
      console.log('Socket has been clicked')
    }

    render() {
      return html`
            <div
                class="socket"
                title="${this.data?.name}"
                @click="${this.handleClick}"
            ></div>
        `
    }
}
