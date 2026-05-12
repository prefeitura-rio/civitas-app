import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import type { GetCirculationIndicatorsResponse } from '@/http/cars/circulation-indicators/get-circulation-indicators'
import { periodsLabels } from '@/http/cars/circulation-indicators/get-circulation-indicators'
import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'
import type { Vehicle } from '@/models/entities'

interface ReportCoverProps {
  circulationIndicators?: GetCirculationIndicatorsResponse
  searchParams: GetCarPathRequest
  totalPoints: number
  cloneAlert: boolean
  vehicle?: Vehicle
}

type BulletPoint = {
  value: string
  children?: BulletPoint[]
}

const bulletPoints: BulletPoint[] = [
  {
    value: 'Estrutura do relatório:',
    children: [
      {
        value: 'Ponto de detecção:',
        children: [
          {
            value:
              'Um ponto de detecção é definido pelo local, data e hora onde uma placa foi detectada por um equipamento de leitura de placa (LPR) da Prefeitura da cidade do Rio de Janeiro.',
          },
          {
            value:
              'Os pontos de detecção possuem uma numeração chamada "posição", que indica  a ordem cronológica dos registros dentro de uma viagem.',
          },
        ],
      },

      {
        value: 'Viagem:',
        children: [
          {
            value:
              'Os pontos de detecção são agrupados em "viagens" no relatório.',
          },
          {
            value:
              'Uma viagem consiste em um conjunto de pontos de detecção com intervalo de tempo inferior a 1 hora entre si.',
          },
          {
            value:
              'As viagens podem ser particionadas para facilitar a visualização dos pontos de detecção.',
          },
          {
            value:
              'O relatório exibe as viagens por meio de mapas e tabelas, destacando os pontos de detecção e seus detalhes.',
          },
        ],
      },
      {
        value: 'Critérios de particionamento de uma viagem:',
        children: [
          {
            value:
              'Viagens são particionadas quando atendem a um ou mais dos seguintes critérios:',
            children: [
              {
                value:
                  'Múltiplos pontos de detecção no mesmo equipamento de leitura de placa (LPR).',
              },
              {
                value: 'Viagem contendo mais de 10 pontos de detecção.',
              },
              {
                value:
                  'Dois pontos subsequentes com uma distância superior a 6 km entre si.',
              },
            ],
          },
        ],
      },
      {
        value: 'Alerta de suspeita de placa clonada:',
        children: [
          {
            value:
              'Um ícone de alerta é exibido quando o intervalo de tempo e a distância entre dois pontos de detecção são incompatíveis. Por exemplo, um curto intervalo de tempo aliado a uma longa distância pode sugerir a presença de dois veículos com a mesma placa circulando simultaneamente.',
          },
          {
            value:
              'Falhas na leitura dos equipamentos de leitura de placa (LPR) podem, entretanto, gerar situações similares ao exemplo acima.',
          },
          {
            value:
              'O alerta é ativado quando a velocidade necessária para percorrer a distância entre dois pontos excede 110 km/h, considerando uma linha reta entre os pontos e desconsiderando possíveis rotas reais.',
          },
          {
            value: 'Os alertas são representados de duas formas:',
            children: [
              {
                value: 'No mapa, por um marcador de cor vermelha.',
              },
              {
                value:
                  'Na tabela, com um ícone vermelho ao lado do índice da posição do ponto.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    value: 'Limitações do relatório:',
    children: [
      {
        value: 'Período disponível para consultas:',
        children: [
          {
            value:
              'Os dados para geração automática deste e de outros relatórios de identificação de pontos de detecção no sistema CIVITAS estão disponíveis apenas a partir de 01/06/2024.',
          },
        ],
      },
      {
        value: 'Conceito de viagem:',
        children: [
          {
            value:
              'A definição de viagem utilizada no relatório é arbitrária e pode ser inadequada em alguns casos. Por exemplo, se uma viagem dura mais de 1 hora e contém apenas duas detecções, uma no início e outra no final, o relatório pode exibi-la como duas viagens separadas.',
          },
        ],
      },
      {
        value: 'Detecção de placas:',
        children: [
          {
            value:
              'A ausência de um registro de detecção não significa que o veículo não passou por uma área monitorada por equipamento de leitura de placa (LPR).',
          },
        ],
      },
      {
        value: 'Aferição de trajetos:',
        children: [
          {
            value:
              'Não é possível determinar o trajeto exato entre os pontos de detecção registrados.',
          },
        ],
      },
      {
        value: 'Alertas de suspeita de placa clonada:',
        children: [
          {
            value: 'Cálculo da velocidade média entre dois pontos:',
            children: [
              {
                value:
                  'O cálculo é baseado na distância em linha reta entre dois pontos na superfície terrestre, sem levar em conta possíveis rotas reais percorridas pelo veículo.',
              },
            ],
          },
        ],
      },
      {
        value: 'Estimativa de velocidade média:',
        children: [
          {
            value:
              'Nem todas as passagens possuem velocidade associada. A ausência dessa informação pode ocorrer devido a falhas na aferição ou à desativação da funcionalidade de estimativa de velocidade no equipamento.',
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
    display: 'flex',
    flexDirection: 'column',
    fontSize: 11,
  },
  title: {
    paddingBottom: 12,

    textAlign: 'center',
    fontFamily: 'Open Sans',
    fontSize: 14,
    fontWeight: 600,
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
  bulletContent: {
    fontFamily: 'Open Sans',
    fontSize: 11,
    textAlign: 'justify',
  },
  tableRow: {
    flexDirection: 'row',
    border: 1,
    borderColor: 'black',
    alignItems: 'stretch',
    marginTop: -1,
  },
  tableRowTitle: {
    borderRight: 1,
    borderColor: 'black',
    padding: 4,
    width: 180,
  },
  tableRowValue: {
    flex: 1,
    padding: 4,
  },
  tableRowTitleText: {
    fontFamily: 'Open Sans',
    fontWeight: 600,
  },
  tableRowValueCompactText: {
    fontSize: 10,
  },
})

export function ReportCover({
  circulationIndicators,
  searchParams,
  totalPoints,
  cloneAlert,
  vehicle,
}: ReportCoverProps) {
  const from = formatDate(searchParams.startTime, "dd/MM/yyyy 'às' HH:mm:ss")
  const to = formatDate(searchParams.endTime, "dd/MM/yyyy 'às' HH:mm:ss")

  const topLocationText = circulationIndicators?.top_location
    ? `${circulationIndicators.top_location.localidade.capitalizeFirstLetter()} (${circulationIndicators.top_location.detections} detecções)`
    : 'Não identificado'

  const topNeighborhoodsText = circulationIndicators?.top_neighborhoods.length
    ? circulationIndicators.top_neighborhoods
        .map(
          (item) =>
            `${item.bairro.capitalizeFirstLetter()} (${item.detections})`,
        )
        .join(', ')
    : 'Não identificados'
  const hasTopNeighborhoods = !!circulationIndicators?.top_neighborhoods.length

  const neighborhoodWithMostDistinctTripsText =
    circulationIndicators?.neighborhood_with_most_distinct_trips
      ? `${circulationIndicators.neighborhood_with_most_distinct_trips.bairro.capitalizeFirstLetter()} (${circulationIndicators.neighborhood_with_most_distinct_trips.distinct_trips} viagens)`
      : 'Não identificado'

  const timePeriodsText =
    circulationIndicators?.time_periods
      .map((item) => `${periodsLabels[item.period]}: ${item.detections}`)
      .join(' | ') ?? 'Não disponível'

  const topTimePeriodText = circulationIndicators?.top_time_period
    ? `${periodsLabels[circulationIndicators.top_time_period.period]} (${circulationIndicators.top_time_period.detections} detecções)`
    : 'Sem detecções no período'

  function renderTableRow(
    title: string,
    value: string | number,
    compact = false,
  ) {
    return (
      <View style={styles.tableRow}>
        <View style={styles.tableRowTitle}>
          <Text style={styles.tableRowTitleText}>{title}</Text>
        </View>
        <View style={styles.tableRowValue}>
          {compact ? (
            <Text style={styles.tableRowValueCompactText}>{value}</Text>
          ) : (
            <Text>{value}</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Informações gerais sobre o relatório:</Text>

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
                  <Text style={styles.bulletTitle}>{subTopic.value}</Text>
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

        <View style={{ flexDirection: 'column', marginTop: 28 }}>
          {renderTableRow('Placa monitorada:', searchParams.plate)}

          {vehicle && (
            <>
              {renderTableRow('Marca/Modelo:', vehicle.marcaModelo)}
              {renderTableRow('Cor:', vehicle.cor)}
              {renderTableRow('Ano Modelo:', vehicle.anoModelo)}
            </>
          )}

          {renderTableRow('Período analisado:', `De ${from} até ${to}`)}
          {renderTableRow('Total de pontos detectados:', totalPoints)}
          {renderTableRow(
            'Suspeita de placa clonada:',
            cloneAlert ? 'Sim' : 'Não',
          )}
          {renderTableRow(
            'Local com maior número de passagens:',
            topLocationText,
          )}
          {renderTableRow(
            'Bairros com mais detecções:',
            topNeighborhoodsText,
            hasTopNeighborhoods,
          )}
          {renderTableRow(
            'Bairro com mais viagens distintas:',
            neighborhoodWithMostDistinctTripsText,
          )}
          {renderTableRow('Turno com mais detecções:', topTimePeriodText)}
          {renderTableRow('Detecções por turnos:', timePeriodsText)}
        </View>
      </View>

      <Text
        style={{
          fontFamily: 'Open Sans',
          fontSize: 11,
          fontWeight: 600,
          marginTop: 36,
          textAlign: 'center',
        }}
      >
        Este relatório foi gerado automaticamente com base nos dados do sistema
        Cerco Digital.
      </Text>
    </>
  )
}
