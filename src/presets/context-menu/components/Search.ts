import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

@customElement('search-component')
export class Search extends LitElement {
  @property({ type: String }) text = ''

  static styles = css`
    .search {
      color: white;
      padding: 1px 8px;
      border: 1px solid white;
      border-radius: 10px;
      font-size: 16px;
      font-family: serif;
      width: 100%;
      box-sizing: border-box;
      background: transparent;
    }
  `

  render() {
    return html`
      <input class="search" 
        .value="${this.text}" 
        @input="${this.handleInput}" 
        data-testid="context-menu-search-input">
      </input>
    `
  }

  handleInput(e: Event) {
    this.text = (e.target as HTMLInputElement).value
    this.dispatchEvent(new CustomEvent('change', { detail: this.text }))
  }
}
