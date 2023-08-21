import './Block'

import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

import vars from '../context-vars'
import { Item as ItemType } from '../types'
import { debounce } from '../utils/debounce'

@customElement('item-component')
export class Item extends LitElement {
  @property({ type: Array }) subitems: ItemType[] = []
  @property({ type: Number }) delay = 0
  @property({ type: Boolean }) visibleSubitems = false
  hide: any

  constructor() {
    super()
    this.hide = debounce(this.delay, this.hideSubitems.bind(this))
  }

  hideSubitems() {
    this.visibleSubitems = false
  }

  render() {
    return html`
      <block-component class="block ${this.subitems ? 'hasSubitems' : ''}" data-testid="context-menu-item">
        <div 
          class="content"
          @click="${(event: Event) => { this.dispatchEvent(new CustomEvent('select', { detail: event })); this.dispatchEvent(new CustomEvent('hide')) }}"
          @wheel="${(event: Event) => event.stopPropagation()}"
          @pointerover="${() => { this.hide.cancel(); this.visibleSubitems = true }}"
          @pointerleave="${() => this.hide.call(this)}"
          @pointerdown="${(event: Event) => event.stopPropagation()}"
        >
          <slot></slot>
          ${this.subitems && this.visibleSubitems ? html`
            <div class="subitems">
              ${this.subitems.map((item) => html`
                <item-component
                  @select="${(event: Event) => item.handler(event)}"
                  .delay="${this.delay}"
                  @hide="${() => this.dispatchEvent(new CustomEvent('hide'))}"
                  .subitems="${item.subitems}"
                >${item.label}</item-component>
              `)}
            </div>
          ` : ''}
        </div>
      </block-component>
    `
  }

  static styles = [vars, css`

    .block {
      padding: 0;
    }

    .content {
      padding: 4px;
      background-color: var(--context-color);
    }

    .hasSubitems:after {
      content: '►';
      position: absolute;
      opacity: 0.6;
      right: 5px;
      top: 5px;
    }

    .subitems {
      position: absolute;
      top: 0;
      left: 100%;
      width: var(--width);
    }
  `]
}
