// Mock implementation of @mapbox/tiny-sdf for Jest tests
class TinySDF {
  constructor(
    fontSize = 24,
    buffer = 3,
    radius = 8,
    cutoff = 0.25,
    fontFamily = 'sans-serif',
    fontWeight = 'normal',
  ) {
    this.fontSize = fontSize
    this.buffer = buffer
    this.radius = radius
    this.cutoff = cutoff
    this.fontFamily = fontFamily
    this.fontWeight = fontWeight
    this.canvas = { width: 0, height: 0 }
    this.ctx = {}
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  draw(_char) {
    return {
      data: new Uint8ClampedArray(32 * 32),
      width: 32,
      height: 32,
      glyphTop: 0,
      glyphLeft: 0,
      glyphWidth: 16,
      glyphHeight: 16,
      glyphAdvance: 16,
    }
  }
}

module.exports = TinySDF
