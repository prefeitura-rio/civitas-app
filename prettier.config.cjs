module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  bracketSameLine: false,
  overrides: [
    {
      // O módulo monta classes CSS próprias com espaço no começo (`${active ? ' active' : ''}`); sem isto o plugin do
      // Tailwind apara esse espaço e junta as classes ("linkactive").
      files: 'src/modules/vehicle-intelligence/**',
      options: { tailwindPreserveWhitespace: true },
    },
  ],
}
