import { Font, Text, View } from '@react-pdf/renderer'

import { cellStyle, hyphenationCallback, styles } from '../../styles'

export interface ReportTimelineProps {
  data: {
    date: string
    keywords: string[]
    location: string
    description: string
  }[]
}

export function ReportTimeline({ data }: ReportTimelineProps) {
  Font.registerHyphenationCallback(hyphenationCallback)

  const rows = [
    ['Data', 'Palavra-chave buscada', 'Local', 'Dinâmica do evento'],
    ...data.map(({ date, keywords, location, description }) => [
      date,
      keywords.join(', '),
      location,
      description,
    ]),
  ]

  return (
    <View style={styles.contentModuloContainer}>
      <Text style={styles.h3}>
        1. Mapeamento de Denúncias - georreferenciamneto de denúncias no período
        XX/XX/XXXX - XX/XX/XXXX
      </Text>
      <Text style={styles.p}>
        Todas as denúncias apresentadas no mapa contém informações sobre a
        dinâmica do evento registrado pela população. Nesta seção, será
        apresentada a tabela com o histórico de ocorrências, bem como a dinâmica
        relatada no(s) hotline(s) ao longo do período solicitado.
      </Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tr}>
          {row.map((cell, colIndex) => (
            <Text
              style={cellStyle({
                colIndex,
                rowIndex,
                totalCols: rows[0].length,
                totalRows: rows.length,
              })}
              wrap={false}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}
