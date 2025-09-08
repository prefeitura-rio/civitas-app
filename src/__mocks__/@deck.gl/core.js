// Mock implementation of @deck.gl/core for Jest tests
const mockLayer = {
  id: 'mock-layer',
  visible: true,
  opacity: 1,
  pickable: true,
  data: [],
  getPosition: () => [0, 0],
  getColor: () => [255, 255, 255, 255],
  getRadius: () => 10,
  updateState: jest.fn(),
  draw: jest.fn(),
  finalizeState: jest.fn(),
}

class MockDeckGL {
  constructor(props) {
    this.props = props
    this.layers = props.layers || []
  }

  render() {
    return null
  }

  setProps(props) {
    this.props = { ...this.props, ...props }
  }

  finalize() {}
}

class Layer {
  constructor(props) {
    Object.assign(this, mockLayer, props)
  }
}

module.exports = {
  DeckGL: MockDeckGL,
  Layer,
  CompositeLayer: Layer,
  default: MockDeckGL,
}
