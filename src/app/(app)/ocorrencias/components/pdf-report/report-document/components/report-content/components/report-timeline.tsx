import { Font, Text, View } from '@react-pdf/renderer'

import { cellStyle, hyphenationCallback, styles } from '../../styles'

export function ReportTimeline() {
  Font.registerHyphenationCallback(hyphenationCallback)

  const rows = [
    ['Data', 'Palavra-chave buscada', 'Local', 'Dinâmica do evento'],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
    [
      'XX/XX/XXXX',
      'Tiroteio subaquático',
      'Rua Machado de Assis, Largo do Machado',
      'Labore cupidatat cupidatat do et. Culpa dolor pariatur pariatur id qui duis anim duis. In cupidatat do aute sunt labore Lorem reprehenderit elit.',
    ],
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
