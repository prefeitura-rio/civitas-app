/** Largura do texto dos rótulos (canvas); sem canvas, uma estimativa pelo número de letras. */
const LABEL_FONT = '600 11.5px Inter'
const measureContext =
  typeof document !== 'undefined'
    ? document.createElement('canvas').getContext('2d')
    : null
export const measureText = (text: string, font = LABEL_FONT) => {
  if (!measureContext) return text.length * 6.5
  measureContext.font = font
  return measureContext.measureText(text).width
}
