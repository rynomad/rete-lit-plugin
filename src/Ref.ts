/* eslint-disable @typescript-eslint/ban-types  */
/* eslint-disable @typescript-eslint/naming-convention */
import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators'

@customElement('ref-element')
export class RefElement extends LitElement {
    @property({ type: Object }) data = {}
    @property({ type: Function }) emit = (_payload: Object) => {
      throw new Error('emit not set properly')
    }

    @query('#element') element: HTMLElement | undefined

    originalElementsFromPoint = document.elementsFromPoint.bind(document)

    updated() {
      this.emit({
        type: 'render',
        data: { ...this.data, element: this.element }
      })
    }

    disconnectedCallback() {
      this.emit({ type: 'unmount', data: { element: this.element } })
      super.disconnectedCallback()
    }

    handlePointerDown() {
      // Stash original function
      const originalElementsFromPoint = this.originalElementsFromPoint

      // Monkey patch
      document.elementsFromPoint = function (x, y) {
        const elements = originalElementsFromPoint(x, y)
        let shadowElements: Element[] = []

        let shadowRoot = elements[0].shadowRoot
        let d = 0

        while (shadowRoot) {
          const innerElements: Element[] = shadowRoot.elementsFromPoint(x, y)

          d++
          shadowElements = innerElements.concat(shadowElements)
          shadowRoot = innerElements[0]?.shadowRoot // Only check the shadow root of the first element
          if (d > 5) break
        }

        return Array.from(new Set(shadowElements.concat(elements)))
      }

      // eslint-disable-next-line
        console.log("ref pointerdown");
    }

    handlePointerUp() {
      // Restore original function after a setImmediate
      setTimeout(() => {
        document.elementsFromPoint = this.originalElementsFromPoint
      }, 0)

      // eslint-disable-next-line
        console.log("ref pointerup");
    }

    render() {
      return html`<div
            id="element"
            @pointerdown="${this.handlePointerDown}"
            @pointerup="${this.handlePointerUp}"
            .data=${this.data}
        ></div>`
    }

    static styles = css`
        /* Add your styles here */
    `
}
