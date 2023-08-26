import { LitElement } from 'lit'

type Instance<P> = { app: LitElement; payload: P }

function setProps(element: LitElement, payload: Record<string, any>) {
  for (const key of Object.keys(payload)) {
    if (key === 'style') continue
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element[key] = payload[key]
  }
}

export function create<P extends Record<string, any>>(
  element: Element,
  component: any,
  payload: P,
  onRendered: any
): Instance<P> {
  const state = payload

  const app = new component()

  app.addEventListener('updated', () => {
    onRendered()
  })

  setProps(app, payload)

  element.appendChild(app)

  onRendered()

  return {
    app,
    payload: state
  }
}

export function update<P extends object>(instance: Instance<P>, payload: P) {
  instance.payload = { ...instance.payload, ...payload }
  setProps(instance.app, instance.payload)
  instance.app.requestUpdate()
}

export function destroy(instance: Instance<unknown>) {
  instance.app.remove()
}

export type Renderer<I> = {
    get(element: Element): I | undefined;
    mount(
        element: Element,
        litComponent: any,
        payload: object,
        onRendered: any
    ): I;
    update(app: I, payload: object): void;
    unmount(element: Element): void;
}

export function getRenderer(): Renderer<Instance<object>> {
  const instances = new Map<Element, Instance<object>>()

  return {
    get(element) {
      return instances.get(element)
    },
    mount(element, litComponent, payload, onRendered) {
      const app = create(element, litComponent, payload, onRendered)

      instances.set(element, app)

      return app
    },
    update(app, payload) {
      update(app, payload)
    },
    unmount(element) {
      const app = instances.get(element)

      if (app) {
        destroy(app)
        instances.delete(element)
      }
    }
  }
}
