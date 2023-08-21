import replace from '@rollup/plugin-replace'
import { ReteOptions } from 'rete-cli'
import scss from 'rollup-plugin-scss'
import css from 'rollup-plugin-lit-css';
import cssOnly from 'rollup-plugin-css-only';

function getPlugins(): NonNullable<ReteOptions['plugins']> {
  return [
    replace({
      values: {
        'process.env.VUECOMPAT': `./litvcompat/litv`
      },
      preventAssignment: true
    }),
    scss({
      insert: true
    })
  ]
}

const litvConfig = {
  output: '.',
  plugins: getPlugins()
}

export default <ReteOptions[]>[litvConfig].map(({ output, plugins }) => ({
    input: "src/index.ts",
    output,
    name: "ReteLitvPlugin",
    globals: {
        rete: "Rete",
        "rete-area-plugin": "ReteAreaPlugin",
        "rete-render-utils": "ReteRenderUtils",
        "lit-html": "lit-html",
        lit: "LitElement",
  },
  plugins: [
          css({ include: ['**/*.css'] }),
    ],
  babel: {
        assumptions: {
            setPublicClassFields: true,
        },
        plugins: [
            [
                "@babel/plugin-transform-typescript",
                {
                    allowDeclareFields: true,
                },
            ],
            [
                "@babel/plugin-proposal-decorators",
                {
                    version: "2018-09",
                    decoratorsBeforeExport: true,
                },
            ],
            ["@babel/plugin-proposal-class-properties"],
        ],
    },
}));