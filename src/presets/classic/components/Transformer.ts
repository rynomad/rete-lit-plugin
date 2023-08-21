/* eslint-disable @typescript-eslint/ban-ts-comment */
// import * as Ajv from 'ajv'
// import { JSONSchemaFaker } from 'json-schema-faker'
import { css, html, LitElement } from 'lit'
import { property } from 'lit/decorators'
import { ClassicPreset } from 'rete'
import { BehaviorSubject, Subscription } from 'rxjs'

// const ajv = new Ajv()

type IODefinition = {
    label: string;
    schema?: object;
    subject?: BehaviorSubject<any>;
    validate?: (outputDef: IODefinition) => boolean;
    subscription?: Subscription;
    socket?: ClassicPreset.Socket
}

type IntermediateDefinition = {
    label: string;
    operator: any;
}

type ContextData = {
    id: string;
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
}

type Context = {
    type: string;
    data: ContextData;
}

export class Transformer extends LitElement {
  static socket = new ClassicPreset.Socket('socket')
  static inputs: IODefinition[] = []
  static outputs: IODefinition[] = []
  static intermediates: IntermediateDefinition[] = []
  static styles = css`
        :host {
            min-width: 100px;
            min-height: 100px;
            display: block;
        }
    `

    @property({ attribute: 'node-id', type: String })
      nodeId!: string
    @property({ type: Boolean })
      selected!: boolean

    inputs: { [label: string]: IODefinition } = {}
    outputs: { [label: string]: IODefinition } = {}
    intermediates: { [label: string]: IntermediateDefinition } = {}

    constructor(private editor: any) {
      super()
      this.processIO(
        (this.constructor as typeof Transformer).inputs,
        this.inputs
      )
      this.processIO(
        (this.constructor as typeof Transformer).outputs,
        this.outputs
      )
      this.processIntermediates(
        (this.constructor as typeof Transformer).intermediates
      )
      this.transform() // Set up the internal pipeline

      // Subscribe to the editor's pipe events
      this.editor.addPipe((context: Context) => {
        if (context.type === 'connectioncreated') {
          try {
            if (context.data.target === this.nodeId) {
              this.subscribe(context.data)
            }
          } catch (error) {
            alert((error as Error).message)
            this.editor.removeConnection(context.data.id)
          }
        } else if (context.type === 'connectionremoved') {
          this.unsubscribe(context.data)
        }
      })
    }

    processIO(
      definitions: IODefinition[],
      ioObject: { [label: string]: IODefinition }
    ) {
      for (const def of definitions) {
        const subject = new BehaviorSubject(null)

        subject.subscribe(() => this.requestUpdate())
        ioObject[def.label] = {
          ...def,
          subject,
          socket: (this.constructor as typeof Transformer).socket,
          validate: this.createValidateFunction(def)
        }
      }
    }

    createValidateFunction(inputDef: IODefinition) {
      return (outputDef: IODefinition) => {
        if (!inputDef.schema) return true
        if (!outputDef.schema) return false

        return true
        // Generate a sample object that complies with the output schema
        // const sampleOutput = JSONSchemaFaker.generate(outputDef.schema as any)

        // // Validate the sample object against the input schema
        // const validateInput = ajv.compile(inputDef.schema)

        // return !!validateInput(sampleOutput)
      }
    }

    processIntermediates(list: IntermediateDefinition[]) {
      for (const item of list) {
        this.intermediates[item.label] = item
      }
    }

    // To be overridden by child class
    // eslint-disable-next-line
    transform() {}

    render() {
      return html``
    }

    subscribe(context: ContextData) {
      if (context.target !== this.nodeId) return

      const sourceNode = this.editor.getNode(context.source)
      const sourceOutput = sourceNode.outputs[context.sourceOutput]
      const targetInput = this.inputs[context.targetInput]

      // Check if the input already has a subscription
      if (targetInput.subscription) {
        throw new Error('Input already has a subscription.')
      }

      // Validate the schema
      if (!targetInput.validate!(sourceOutput)) {
        throw new Error('Schema validation failed.')
      }

      // Subscribe the input to the output
      targetInput.subscription = sourceOutput.subject.subscribe(
        (value: any) => {
                targetInput.subject!.next(value)
        }
      )
    }

    unsubscribe(context: ContextData) {
      if (context.target !== this.nodeId) return

      const targetInput = this.inputs[context.targetInput]

      // Unsubscribe the input
      if (targetInput.subscription) {
        targetInput.subscription.unsubscribe()
        delete targetInput.subscription
      }
    }
}
