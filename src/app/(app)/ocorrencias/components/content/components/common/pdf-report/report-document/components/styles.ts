import { StyleSheet } from '@react-pdf/renderer'
import { hyphenateSync as hyphenate } from 'hyphen/pt'

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  contentContainer: {
    paddingHorizontal: 56,
  },
  contentModuloContainer: {
    marginBottom: 16,
  },
  h1: {
    fontSize: 20,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 16,
  },
  h2: {
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 16,
  },
  h3: {
    fontSize: 14,
    marginBottom: 8,
  },
  h4: {
    fontSize: 12,
    marginBottom: 4,
  },
  p: {
    fontSize: 12,
    textAlign: 'justify',
    marginBottom: 14,
    textIndent: 30,
    lineHeight: 1.2,
  },
  tr: {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'nowrap',
  },
  td: {
    borderColor: 'black',
    borderLeft: 1,
    borderTop: 1,
    borderBottom: 1,
    padding: 4,
  },
} as const)

export const title = 'RELATÓRIO DE EXTRAÇÃO DENÚNCIAS DD E/OU 1746'

export interface CellStyleProps {
  colSpan?: number
  colIndex?: number
  rowIndex?: number
  totalRows?: number
  totalCols?: number
}

export function cellStyle({
  colSpan = 1,
  colIndex = 0,
  rowIndex = 0,
  totalCols = 1,
  // totalRows = 1,
}: CellStyleProps) {
  return {
    ...styles.td,
    width: `${(100 * colSpan) / totalCols}%`,
    borderRight: colIndex === totalCols - 1 ? 1 : undefined,
    // borderBottom: rowIndex === totalRows - 1 ? 1 : undefined,
    marginTop: rowIndex !== 0 ? -1 : undefined,
  }
}

export function hyphenationCallback(word: string) {
  const hyphenated = hyphenate(word, { hyphenChar: '*' })
  const splited = hyphenated.split('*')
  return splited
}
