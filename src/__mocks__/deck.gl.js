// Mock implementation of deck.gl for Jest tests
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

module.exports = {
  DeckGL: MockDeckGL,
  IconLayer: class MockIconLayer {
    constructor(props) {
      return { ...mockLayer, ...props, type: 'IconLayer' }
    }
  },
  ScatterplotLayer: class MockScatterplotLayer {
    constructor(props) {
      return { ...mockLayer, ...props, type: 'ScatterplotLayer' }
    }
  },
  default: MockDeckGL,
}
