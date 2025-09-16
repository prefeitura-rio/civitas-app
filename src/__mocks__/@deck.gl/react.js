// Mock implementation of @deck.gl/react for Jest tests
// eslint-disable-next-line @typescript-eslint/no-var-requires
const React = require('react')

const MockDeckGL = React.forwardRef((props, ref) => {
  return React.createElement('div', {
    'data-testid': 'mock-deckgl',
    ref,
    ...props,
  })
})

MockDeckGL.displayName = 'MockDeckGL'

module.exports = {
  DeckGL: MockDeckGL,
  default: MockDeckGL,
}
