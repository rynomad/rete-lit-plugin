import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

import vars from '../context-vars'
import { Item } from '../types'
import { debounce } from '../utils/debounce'

@customElement('menu-component')
export class Menu extends LitElement {
  @property({ type: Array }) items: Item[] = []
  @property({ type: Number }) delay = 0
  @property({ type: Boolean }) searchBar = false
  // eslint-disable-next-line
  @property({ type: Function }) onHide = () => { }
  @property({ type: String }) seed = ''
  @property({ type: String }) filter = ''

  hide: any

  constructor() {
    super()
    this.hide = debounce(this.delay, this.onHide)
  }

  getItems() {
    const filterRegexp = new RegExp(this.filter, 'i')
    const filteredList = this.items.filter(item => (
      item.label.match(filterRegexp)
    ))

    return filteredList
  }

  connectedCallback() {
    super.connectedCallback()
  }

  disconnectedCallback() {
    if (this.hide) this.hide.cancel()
    super.disconnectedCallback()
  }

  render() {
    return html`
        <div
            class="menu"
            @mouseover="${this.hide.cancel}"
            @mouseleave="${this.hide.call}"
            data-testid="context-menu"
            rete-context-menu
        >
            ${this.searchBar
    ? html`
                      <block-component>
                          <search-component
                              .text="${this.filter}"
                              @change="${(e: Event) =>
    (this.filter = (e as CustomEvent).detail)}"
                          ></search-component>
                      </block-component>
                  `
    : ''}
            ${this.getItems().map(
    (item) => html`
                    <item-component
                        @select="${item.handler}"
                        .delay="${this.delay}"
                        @hide="${this.onHide}"
                        .subitems="${item.subitems}"
                    >
                        ${item.label}
                    </item-component>
                `
  )}
        </div>
    `
  }

  static styles =[vars, css`

    .menu {
      padding: 10px;
      width: var(--width);
      margin-top: -20px;
      margin-left: calc(var(--width) / -2);
    }
  `]
}
