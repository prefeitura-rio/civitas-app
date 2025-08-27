import '@/utils/string-extensions'

import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'
import { dateConfig } from '@/lib/date-config'

interface RadarReportCoverProps {
  radarIds: string[]
  location: string
  latitude: number
  longitude: number
  fromDate: Date
  toDate: Date
  totalDetections: number
  plate?: string
}
type BulletPoint = {
  value: string
  children?: BulletPoint[]
}

const bulletPoints: BulletPoint[] = [
  {
    value: 'Parâmetros de busca:',
    children: [
      {
        value: 'Equipamento ou área da busca:',
        children: [
          {
            value:
              'A determinação do local de busca é realizada por meio da seleção de um ou mais radares localizados em uma área específica, definida pelo solicitante. A análise é conduzida pelo sistema de forma automática utilizando apenas os dados dos radares selecionados.',
          },
        ],
      },
      {
        value: 'Intervalo de tempo:',
        children: [
          {
            value:
              'O intervalo de tempo para a análise é determinado pelo solicitante da informação, com um limite de até uma hora(1h) por busca. Caso não haja especificação por parte do solicitante, a equipe operacional da CIVITAS aplicará um intervalo padrão de 1 hora(1h).',
          },
        ],
      },
      {
        value: 'Quantidade de placas adjacentes:',
        children: [
          {
            value:
              'Não há um limite máximo para o número de placas a serem detectadas dentro do intervalo de tempo selecionado. O sistema irá registrar todas as placas detectadas nos radares dentro do intervalo de tempo especificado, sem restrições de quantidade.',
          },
        ],
      },
    ],
  },
  {
    value: 'Radares e localização:',
    children: [
      {
        value:
          'Cada radar possui um número identificador próprio. Todas as detecções feitas pelo sistema apontam o número identificador do equipamento que fez a leitura.',
      },
      {
        value:
          'Cada radar possui também informações de localização que incluem coordenadas geográficas e endereços completos. Essas informações também estão disponíveis junto a cada registro.',
      },
      {
        value:
          'O sentido de circulação da via é fornecido, salvo quando há indisponibilidade da informação no banco de dados.',
      },
    ],
  },
  {
    value: 'Limitações do relatório:',
    children: [
      {
        value: 'Período disponível:',
        children: [
          {
            value:
              'A base de dados dos Sistema conta com um histórico de detecções a partir da data de 01/06/2024. Não é possível realizar buscas a períodos anteriores.',
          },
        ],
      },
      {
        value: 'Ausência de detecção:',
        children: [
          {
            value:
              'Podem ocorrer problemas técnicos que inviabilizam a leitura do OCR de algumas placas, tais como: placas em mau estado de conservação, objetos obstruindo as câmeras de leitura, condições climáticas, períodos de inatividade do equipamento e outros.',
          },
          {
            value:
              'O relatório não é exaustivo e a falta de registro de uma determinada placa não é determinante para comprovar que não houve a passagem naquela localidade.',
          },
          {
            value:
              'Por razões técnicas, operacionais ou devido ao desgaste das placas, os radares podem não conseguir realizar a leitura completa do OCR. Nesses casos, duas situações podem ocorrer: (1) se o equipamento registrar a passagem do veículo e identificar parte da placa, a linha na planilha será exibida com marcação tracejada ou mostrará os caracteres parciais capturados; (2) se o radar registrar apenas a passagem do veículo, sem conseguir ler nenhum caractere da placa, a linha será exibida em branco na planilha.',
          },
        ],
      },
      {
        value: 'Casos de ausência de detecção (parcial ou total):',
        children: [
          {
            value:
              'Há a possibilidade de inatividade de radares durante o período solicitado, o que pode resultar na ausência de registros de detecção. Essa inatividade pode ocorrer por diversos motivos técnicos, como falhas no fornecimento de energia, interrupções na comunicação de dados, problemas de calibração do equipamento, ou falhas no funcionamento do próprio radar. Quando um radar está inativo, ele não realiza a detecção das placas de veículos, resultando em lacunas nos dados.',
          },
        ],
      },
    ],
  },
]

Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 600,
    },
  ],
})

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Open Sans',
    flexDirection: 'column',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  infos: {
    paddingTop: 20,
  },
  label: {
    fontWeight: 'bold',
  },
  p: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    textAlign: 'justify',
    marginBottom: 14,
    textIndent: 30,
    lineHeight: 1.2,
  },
  h1: {
    fontFamily: 'Open Sans',
    fontSize: 20,
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 16,
  },
  h2: {
    fontFamily: 'Open Sans',
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 16,
  },
  bulletRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  bulletSubRow: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 20,
  },
  bulletSubSubRow: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 40,
  },
  bulletSubSubSubRow: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 60,
  },
  bullet: {
    height: '100%',
  },
  bulletTitle: {
    fontFamily: 'Open Sans',
    fontSize: 11,
    fontWeight: 600,
  },
  normalBulletTitle: {
    fontFamily: 'Open Sans',
    fontSize: 11,
  },
  bulletContent: {
    fontFamily: 'Open Sans',
    fontSize: 11,
    textAlign: 'justify',
  },
  tableRow: {
    flexDirection: 'row',
    border: 1,
    borderColor: 'black',
    alignItems: 'center',
    marginTop: -1,
  },
  tableRowTitle: {
    fontFamily: 'Open Sans',
    fontWeight: 600,
    borderRight: 1,
    borderColor: 'black',
    padding: 4,
    width: 180,
  },
})

export function RadarReportCover({
  radarIds,
  latitude,
  longitude,
  location,
  fromDate,
  toDate,
  totalDetections,
  plate,
}: RadarReportCoverProps) {
  const commons = [
    {
      label: 'Localização:',
      value: location,
    },
    {
      label: 'Período analisado:',
      value: `De ${formatDate(fromDate, 'dd/MM/yyyy HH:mm:ss', { locale: dateConfig.locale })} até ${formatDate(toDate, 'dd/MM/yyyy HH:mm:ss', { locale: dateConfig.locale })}`,
    },
    {
      label: 'Placa:',
      value: plate,
    },
    {
      label: 'Latitude:',
      value: latitude,
    },
    {
      label: 'Longitude:',
      value: longitude,
    },
    {
      label: 'Total de placas detectadas:',
      value: totalDetections,
    },
    {
      label: 'Radares:',
      value: radarIds.join(', '),
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Informações gerais sobre o relatório</Text>
      <Text style={styles.bulletTitle}>Estrutura do relatório:</Text>
      <Text style={styles.normalBulletTitle}>
        Este relatório apresenta os dados de passagens de veículos com base em
        uma busca realizada por equipamento de radar ou por um conjunto desses
        equipamentos em uma determinada localidade. As placas registradas são
        organizadas em ordem cronológica e as buscas são feitas pelo sistema de
        acordo com os parâmetros definidos pelo solicitante da informação, como
        período de análise e localização dos radares considerados. Este
        documento é gerado automaticamente pelo sistema, sem interferência
        humana. Todo esse documento é auditável.
      </Text>
      {bulletPoints.map((topic, i) => (
        <View key={i}>
          <View style={styles.bulletRow}>
            <Text>{'\u2022' + ' '}</Text>
            <Text style={styles.bulletTitle}>{topic.value}</Text>
          </View>

          {topic.children?.map((subTopic, j) => (
            <View key={j}>
              <View style={styles.bulletSubRow}>
                <Text style={styles.bulletTitle}>{'\u2022' + ' '}</Text>
                <Text
                  style={
                    topic.value === 'Radares e localização:'
                      ? styles.normalBulletTitle
                      : styles.bulletTitle
                  }
                >
                  {subTopic.value}
                </Text>
              </View>

              {subTopic.children?.map((subSubTopic, k) => (
                <View key={k}>
                  <View style={styles.bulletSubSubRow}>
                    <Text style={styles.bulletTitle}>{'\u2022' + ' '}</Text>
                    <Text
                      style={
                        subSubTopic.children
                          ? styles.bulletTitle
                          : styles.bulletContent
                      }
                    >
                      {subSubTopic.value}
                    </Text>
                  </View>

                  {subSubTopic.children?.map((subSubSubTopic, index) => (
                    <View key={index} style={styles.bulletSubSubSubRow}>
                      <Text style={styles.bulletTitle}>{'\u2022' + ' '}</Text>
                      <Text style={styles.bulletContent}>
                        {subSubSubTopic.value}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
      <View style={styles.infos}>
        {commons.map(
          (item, index) =>
            (item === undefined || item === null || item.value !== '') && (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{item.label}</Text>
                <Text>{item.value}</Text>
              </View>
            ),
        )}
      </View>
    </View>
  )
}
