// Mock implementation of @deck.gl/layers for Jest tests
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

class MockIconLayer {
  constructor(props) {
    return { ...mockLayer, ...props, type: 'IconLayer' }
  }
}

class MockScatterplotLayer {
  constructor(props) {
    return { ...mockLayer, ...props, type: 'ScatterplotLayer' }
  }
}

module.exports = {
  IconLayer: MockIconLayer,
  ScatterplotLayer: MockScatterplotLayer,
  TextLayer: class MockTextLayer {
    constructor(props) {
      return { ...mockLayer, ...props, type: 'TextLayer' }
    }
  },
}
