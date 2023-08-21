/* eslint-disable @typescript-eslint/ban-ts-comment */
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'
import { ClassicPreset } from 'rete'
import { Socket } from 'rete/_types/presets/classic'

import vars from '../vars'

function sortByIndex(entries: any = []) {
  entries.sort((a: any, b: any) => {
    const ai = (a[1] && a[1].index) || 0
    const bi = (b[1] && b[1].index) || 0

    return ai - bi
  })
  return entries
}

@customElement('node-component')
export class Node extends LitElement {
    @property({ type: Object }) data:
      | ClassicPreset.Node
        | undefined
    @property({ type: Function }) emit = () => {
      throw new Error('emit not set properly')
    }
    @property({ type: String }) seed = ''

    nodeStyles() {
      // @ts-ignore
      return `width: ${this.data?.width || '100px'}; height: ${
        // @ts-ignore
        this.data?.height || '100px'
      }`
    }

    inputs() {
      // @ts-ignore
      return sortByIndex(Object.entries(this.data?.inputs || {}))
    }

    controls() {
      // @ts-ignore
      return sortByIndex(Object.entries(this.data?.controls || {}))
    }

    outputs() {
      // @ts-ignore
      return sortByIndex(Object.entries(this.data?.outputs || {}))
    }

    static styles = [
      vars,
      css`
            :host {
                display: block;
            }

            .node {
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
                line-height: initial;
                font-family: Arial;
            }

            .node:hover {
                background: linear-gradient(
                        rgba(255, 255, 255, 0.04),
                        rgba(255, 255, 255, 0.04)
                    ),
                    var(--node-color);
            }

            .node.selected {
                background: var(--node-color-selected);
                border-color: #e3c000;
            }

            .node .title {
                color: white;
                font-family: sans-serif;
                font-size: 18px;
                padding: 8px;
            }

            .node .output {
                text-align: right;
            }
            .node .input {
                text-alight: left;
            }

            .node .input-socket {
                text-align: left;
                margin-left: calc(
                    (var(--socket-size) / -2) - var(--socket-margin)
                );
                display: inline-block;
            }

            .node .output-socket {
                text-align: right;
                margin-right: calc(
                    (var(--socket-size) / -2) - var(--socket-margin)
                );
                display: inline-block;
            }

            .node .input-title,
            .node .output-title {
                vertical-align: middle;
                color: white;
                display: inline-block;
                font-family: sans-serif;
                font-size: 14px;
                margin: var(--socket-margin);
                line-height: var(--socket-size);
            }

            .node .input-control {
                z-index: 1;
                width: calc(
                    100% - var(--socket-size) - 2 * var(--socket-margin)
                );
                vertical-align: middle;
                display: inline-block;
            }

            .node .input-title[hidden],
            .node .output-title[hidden] {
                display: none;
            }

            .node .control {
                padding: var(--socket-margin)
                    calc(var(--socket-size) / 2 + var(--socket-margin));
                display: block;
                margin: -4px;
            }
        `
    ]

    render() {
      return html`
            <div
                class="node ${this.data?.selected ? 'selected' : ''}"
                style=${this.nodeStyles()}
                data-testid="node"
            >
                <div class="title" data-testid="title">${this.data?.label}</div>

                <!-- Outputs -->
                ${this.outputs().map(
    ([key, output]:
                        | string
                        | ClassicPreset.Output<Socket>[]) => html`
                        <div class="output" data-testid="output-${key}">
                            <div
                                class="output-title"
                                data-testid="output-title"
                            >
                                ${(output as ClassicPreset.Output<Socket>)
    .label}
                            </div>
                            <ref-element
                                class="output-socket"
                                .data=${{
    type: 'socket',
    side: 'output',
    key: key,
    nodeId: this.data?.id,
    payload: (
                                        output as ClassicPreset.Output<Socket>
    ).socket
  }}
                                .emit=${this.emit}
                                data-testid="output-socket"
                            ></ref-element>
                        </div>
                    `
  )}

                <!-- Controls -->
                ${this.controls().map(
    ([key, control]: string | ClassicPreset.Control[]) => html`
                        <ref-element
                            data-testid="control-${key}"
                            class="control"
                            .emit=${this.emit}
                            .data=${{ type: 'control', payload: control }}
                        ></ref-element>
                    `
  )}

                <!-- Inputs -->
                ${this.inputs().map(
    ([key, input]:
                        | string
                        | ClassicPreset.Input<Socket>[]) => html`
                        <div class="input" data-testid="input-${key}">
                            <ref-element
                                class="input-socket"
                                .data=${{
    type: 'socket',
    side: 'input',
    key: key,
    nodeId: this.data?.id,
    payload: (
                                        input as ClassicPreset.Input<Socket>
    ).socket
  }}
                                .emit=${this.emit}
                                data-testid="input-socket"
                            ></ref-element>
                            <div
                                class="input-title"
                                ?hidden=${(input as ClassicPreset.Input<Socket>)
    .control &&
                                (input as ClassicPreset.Input<Socket>)
                                  .showControl}
                                data-testid="input-title"
                            >
                                ${(input as ClassicPreset.Input<Socket>).label}
                            </div>
                            <ref-element
                                ?hidden=${!(
                                    input as ClassicPreset.Input<Socket>
  ).control &&
                                (input as ClassicPreset.Input<Socket>)
                                  .showControl}
                                .emit=${this.emit}
                                .data=${{
    type: 'control',
    payload: (
                                        input as ClassicPreset.Input<Socket>
    ).control
  }}
                                data-testid="input-control"
                                class="input-control"
                            ></ref-element>
                        </div>
                    `
  )}
            </div>
        `
    }
}
