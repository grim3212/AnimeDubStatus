import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  { ignores: ['cdk.out/**', 'public/data/**'] },
  {
    rules: {
      // Tailwind class lists already make tags long; one attribute per line hurts more than it helps.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
)
