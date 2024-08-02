import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'

import { ReportFooter } from '../../../../../../../common/report-footer'

interface ReportCoverProps {
  searchParams: GetCarPathRequest
  totalPoints: number
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
              'Os pontos de detecção possuem uma numeração chamada "posição" que representa a ordem temporal de detecção dentro de uma viagem.',
          },
        ],
      },

      {
        value: 'Viagem:',
        children: [
          {
            value:
              'No relatório, os pontos de detecção são organizados em grupos chamados "viagens".',
          },
          {
            value:
              'Uma viagem é um conjunto de pontos de detecção com uma distância temporal entre si inferior a 1 hora.',
          },
          {
            value:
              'Uma viagem pode ser dividida em partes para melhor representar os pontos de detecção.',
          },
          {
            value:
              'Uma viagem é representada no relatório por um ou mais mapas e tabelas, dependendo de como ela foi dividida em partes. Neles, são apresentados os pontos de detecção e seus detalhes.',
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
                value: 'Existem múltiplos pontos de detecção no mesmo radar.',
              },
              {
                value: 'A viagem contém mais de 10 pontos de detecção.',
              },
              {
                value:
                  'Dois pontos subsequentes têm uma distância superior a 6 km entre si.',
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
              'A definição de viagem utilizada neste relatório é arbitrária e pode falhar em alguns casos. Por exemplo, viagens de mais de 1 hora, onde a placa foi detectada apenas duas vezes, uma próxima do início e outra próxima do fim, podem ser representadas no relatório como duas viagens distintas se o intervalo entre detecções for superior a 1 hora.',
          },
        ],
      },
      {
        value: 'Detecção de placas:',
        children: [
          {
            value:
              'A ausência de um registro não garante que o veículo não tenha passado por um local com radar.',
          },
        ],
      },
      {
        value: 'Aferição de trajetos:',
        children: [
          {
            value:
              'Não é possível determinar o trajeto exato do veículo entre os pontos detectados.',
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

export function ReportCover({ searchParams, totalPoints }: ReportCoverProps) {
  const from = formatDate(searchParams.startTime, "dd/MM/yyyy 'às' HH:mm:ss")
  const to = formatDate(searchParams.endTime, "dd/MM/yyyy 'às' HH:mm:ss")

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Informações gerais sobre o relatório:</Text>

        {bulletPoints.map((topic) => (
          <>
            <View style={styles.bulletRow}>
              <Text>{'\u2022' + ' '}</Text>
              <Text style={styles.bulletTitle}>{topic.value}</Text>
            </View>

            {topic.children?.map((subTopic) => (
              <>
                <View style={styles.bulletSubRow}>
                  <Text style={styles.bulletTitle}>{'\u2022' + ' '}</Text>
                  <Text style={styles.bulletTitle}>{subTopic.value}</Text>
                </View>

                {subTopic.children?.map((subSubTopic) => (
                  <>
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
                  </>
                ))}
              </>
            ))}
          </>
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
