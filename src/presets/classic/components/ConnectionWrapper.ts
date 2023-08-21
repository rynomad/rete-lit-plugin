/* eslint-disable @typescript-eslint/ban-types */
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators'

@customElement('connection-wrapper')
export class ConnectionWrapper extends LitElement {
    @property({ type: Object }) component: any
    @property({ type: Object }) data: any
    @property({ type: Object }) start: any
    @property({ type: Object }) end: any
    @property({ type: Function }) path: Function = () => {
      throw new Error('PATH FUNCTION NOT SET PROPERLY')
    }

    observedStart = { x: 0, y: 0 }
    observedEnd = { x: 0, y: 0 }
    observedPath = ''
    onDestroy: Function | null = null

    constructor() {
      super()
    }

    connectedCallback() {
      super.connectedCallback()
      this.initializeWatchers()
      this.fetchPath()
    }

    disconnectedCallback() {
      if (this.onDestroy) this.onDestroy()
      super.disconnectedCallback()
    }

    initializeWatchers() {
      const unwatch1 =
            typeof this.start === 'function' &&
            this.start((pos: any) => {
              this.observedStart = pos
              this.fetchPath() // Fetch the new path when start changes
            })

      const unwatch2 =
            typeof this.end === 'function' &&
            this.end((pos: any) => {
              this.observedEnd = pos
              this.fetchPath() // Fetch the new path when end changes
            })

      this.onDestroy = () => {
        unwatch1 && unwatch1()
        unwatch2 && unwatch2()
      }
    }

    async fetchPath() {
      if (this.startPosition && this.endPosition) {
        this.observedPath = await this.path(
          this.startPosition,
          this.endPosition
        )
        this.requestUpdate() // Request re-render
      }
    }

    get startPosition() {
      return this.start && 'x' in this.start
        ? this.start
        : this.observedStart
    }

    get endPosition() {
      return this.end && 'x' in this.end ? this.end : this.observedEnd
    }

    render() {
      if (this.component) {
        const dynamicComponent = new this.component()

        dynamicComponent.data = this.data
        dynamicComponent.start = this.startPosition
        dynamicComponent.end = this.endPosition
        dynamicComponent.path = this.observedPath

        return html`${dynamicComponent}`
      }

      return html``
    }
}
