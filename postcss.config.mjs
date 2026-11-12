/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {},
    // Inteligência Veicular: o CSS do módulo (src/modules/vehicle-intelligence) vale só dentro de `.iv-root`, o
    // contêiner do módulo, para não vazar para o resto do app (e o do app não ser sobrescrito por ele).
    'postcss-prefix-selector': {
      prefix: '.iv-root',
      includeFiles: [/[\\/]src[\\/]modules[\\/]vehicle-intelligence[\\/]/],
      transform(prefix, selector, prefixedSelector) {
        if (selector.startsWith(prefix)) return selector
        if ([':root', 'html', 'body', '#root'].includes(selector)) return prefix
        if (selector === '*') return `${prefix}, ${prefix} *`
        return prefixedSelector
      },
    },
    'tailwindcss/nesting': {},
    tailwindcss: {},
    // autoprefixer: {},
  },
}

export default config
