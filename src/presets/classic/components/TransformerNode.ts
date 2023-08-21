import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

import vars from '../vars'
import { Transformer } from './Transformer'

@customElement('transformer-node')
export class TransformerNode extends LitElement {
    @property({ type: Object })
  get data(): Transformer | undefined {
    return this._data
  }
    set data(val: Transformer | undefined) {
      const oldVal = this._data

      this._data = val
      if (val && !oldVal) {
        this.appendChild(val)
      }
      this.requestUpdate('data', oldVal)
    }
    @property({ type: Function }) emit = () => {
      throw new Error('emit not set properly')
    }
    @property({ type: String }) seed = ''

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private _data: Transformer | undefined

    static styles = [
      vars,
      css`
            :host {
                display: block;
            }

            .node {
                display: flex;
                flex-direction: column;
                background: var(--node-color);
                border: 2px solid #4e58bf;
                border-radius: 10px;
                cursor: pointer;
                box-sizing: border-box;
                width: var(--node-width);
                height: auto;
                padding-bottom: 6px;
                position: relative;
                user-select: none;
            }

            .inputs,
            .outputs {
                display: flex;
                flex-direction: row;
            }

            .inputs .input-socket {
                margin-top: calc(
                    (var(--socket-size) / -2) - var(--socket-margin)
                );
            }

            .outputs .output-socket {
                margin-bottom: calc(
                    (var(--socket-size) / -2) - var(--socket-margin)
                );
            }

            .input {
                display: flex;
                flex-direction: column;
            }

            .output {
                display: flex;
                flex-direction: column-reverse;
            }

            /* You can add other CSS rules here as needed */
        `
    ]

    render() {
      return html`
            <div class="node">
                <div class="inputs">
                    ${Object.entries(this.data?.inputs || {}).map(
    ([key, input]) => html`
                            <div class="input">
                                <ref-element
                                    class="input-socket"
                                    .emit=${this.emit}
                                    .data=${{
    type: 'socket',
    side: 'input',
    key: key,
    nodeId: this.data?.nodeId,
    payload: input.socket
  }}
                                ></ref-element>
                                <div class="input-title">${input.label}</div>
                            </div>
                        `
  )}
                </div>

                <slot></slot>

                <div class="outputs">
                    ${Object.entries(this.data?.outputs || {}).map(
    ([key, output]) => html`
                            <div class="output">
                                <div class="output-title">${output.label}</div>
                                <ref-element
                                    class="output-socket"
                                    .emit=${this.emit}
                                    .data=${{
    type: 'socket',
    side: 'output',
    key: key,
    nodeId: this.data?.nodeId,
    payload: output.socket
  }}
                                ></ref-element>
                            </div>
                        `
  )}
                </div>
            </div>
        `
    }
}
