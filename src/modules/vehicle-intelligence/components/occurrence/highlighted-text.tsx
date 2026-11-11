import type { ReactNode } from 'react'

/** Minúsculas e sem acento, mantendo o índice de cada caractere do original. */
function foldWithOffsets(text: string): { folded: string; offsets: number[] } {
  let folded = ''
  const offsets: number[] = []
  let index = 0
  for (const character of text) {
    const base = character
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    for (const piece of base) {
      folded += piece
      offsets.push(index)
    }
    index += character.length
  }
  offsets.push(index)
  return { folded, offsets }
}

export function foldSearchText(text: string): string {
  return foldWithOffsets(text).folded
}

/** Trechos do texto que casam com os termos (já normalizados), sem sobreposição. */
export function matchRanges(
  text: string,
  terms: string[],
): Array<[number, number]> {
  if (!terms.length) return []
  const { folded, offsets } = foldWithOffsets(text)
  const ranges: Array<[number, number]> = []
  for (const term of terms) {
    let from = 0
    // eslint-disable-next-line no-unmodified-loop-condition -- `from` muda na própria condição
    while (term && (from = folded.indexOf(term, from)) !== -1) {
      ranges.push([offsets[from], offsets[from + term.length]])
      from += term.length
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  return ranges.reduce<Array<[number, number]>>((merged, range) => {
    const last = merged.at(-1)
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push([...range])
    return merged
  }, [])
}

/** Texto com os termos buscados marcados; `window` recorta um trecho em volta do 1º achado. */
export function HighlightedText({
  text,
  terms,
  window,
}: {
  text: string
  terms: string[]
  window?: number
}) {
  const ranges = matchRanges(text, terms)
  let start = 0
  let end = text.length
  if (window && ranges.length) {
    start = Math.max(0, ranges[0][0] - window)
    end = Math.min(text.length, ranges[0][1] + window * 2)
  }
  const parts: ReactNode[] = []
  let cursor = start
  ranges
    .filter(([a, b]) => b > start && a < end)
    .forEach(([a, b], index) => {
      const from = Math.max(a, start)
      const to = Math.min(b, end)
      if (from > cursor) parts.push(text.slice(cursor, from))
      parts.push(<mark key={index}>{text.slice(from, to)}</mark>)
      cursor = to
    })
  if (cursor < end) parts.push(text.slice(cursor, end))
  return (
    <>
      {start > 0 && '…'}
      {parts}
      {end < text.length && '…'}
    </>
  )
}
