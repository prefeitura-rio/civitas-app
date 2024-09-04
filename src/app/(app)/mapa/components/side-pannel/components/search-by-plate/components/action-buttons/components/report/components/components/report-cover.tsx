import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'

import { ReportFooter } from '../../../../../../../common/report-footer'

interface ReportCoverProps {
  searchParams: GetCarPathRequest
  totalPoints: number
  cloneAlert: boolean
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
              'Um ponto de detecção é definido pelo local, data e hora onde uma placa foi detectada por um radar da Prefeitura da cidade do Rio de Janeiro.',
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
                value: 'Múltiplos pontos de detecção no mesmo radar.',
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
              'Falhas na leitura dos radares podem, entretanto, gerar situações similares ao exemplo acima.',
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
              'A ausência de um registro de detecção não significa que o veículo não passou por uma área monitorada por radar.',
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

export function ReportCover({
  searchParams,
  totalPoints,
  cloneAlert,
}: ReportCoverProps) {
  const from = formatDate(searchParams.startTime, "dd/MM/yyyy 'às' HH:mm:ss")
  const to = formatDate(searchParams.endTime, "dd/MM/yyyy 'às' HH:mm:ss")

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

                    {subSubTopic.children?.map((subSubSubTopic) => (
                      <View style={styles.bulletSubSubSubRow}>
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
          <View style={styles.tableRow}>
            <Text style={styles.tableRowTitle}>Placa monitorada:</Text>
            <Text style={{ padding: 4 }}>{searchParams.plate}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableRowTitle}>Período analisado:</Text>
            <Text style={{ padding: 4 }}>{`De ${from} até ${to}`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableRowTitle}>
              Total de pontos detectados:
            </Text>
            <Text style={{ padding: 4 }}>{totalPoints}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableRowTitle}>Suspeita de placa clonada:</Text>
            <Text style={{ padding: 4 }}>{cloneAlert ? 'Sim' : 'Não'}</Text>
          </View>
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
      <ReportFooter />
    </>
  )
}
