import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatDate } from 'date-fns'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'

import { ReportFooter } from './report-footer'
import { ReportHeader } from './report-header'
import { Watermark } from './report-watermark'

interface ReportCoverProps {
  searchParams: GetCarPathRequest
  totalPoints: number
}

const bulletPoints = [
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
              'Os pontos de detecção possuem uma numeração chamada de "posição" que representa a ordem temporal de detecção dentro de uma viagem.',
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
              'Uma viagem é definida como um conjunto de pontos de detecção que possuem uma distância temporal entre si inferior a 1 hora.',
          },
          {
            value:
              'Uma viagem é representada no relatório por meio de um mapa e uma tabela, onde são dispostos os pontos de detecção e seus detalhes.',
          },
        ],
      },
    ],
  },
  {
    value: 'Limitações do relatório:',
    children: [
      {
        value: 'No conceito de viagem:',
        children: [
          {
            value:
              'A definição de viagem utilizada neste relatório é arbitrária e pode falhar em alguns casos. Por exemplo, em uma viagem longa de mais de 1 hora, onde a placa foi detectada apenas duas vezes, uma próxima do início e outra próxima do fim, poderá ser representada no relatório como duas viagens distintas de apenas um ponto de detecção cada, caso o intervalo de tempo entre uma detecção e outra seja superior a 1 hora.',
          },
        ],
      },
      {
        value: 'Na detecção de placas:',
        children: [
          {
            value:
              'A ausência de um registro não garante que o veículo não tenha passado por um local que tenha radar.',
          },
        ],
      },
      {
        value: 'Na aferição de trajetos:',
        children: [
          {
            value:
              'Não é possível determinar o trajeto exato do veículo entre os pontos detectados.',
          },
        ],
      },
      {
        value: 'No mapa de pontos de detecção:',
        children: [
          {
            value:
              'É importante notar que, se um veículo passar mais de uma vez pelo mesmo radar durante uma viagem, os ícones que representam a detecção do veículo serão exibidos sobrepostos, o que pode dificultar a visualização. Portanto, nesses casos, é imprescindível consultar a tabela de pontos de detecção para um melhor entendimento do trajeto do veículo.',
          },
          {
            value:
              'Os mapas de pontos de detecção são gerados apenas para viagens que possuem menos de 100 pontos de detecção.',
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
    paddingVertical: 20,
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
  const from = formatDate(searchParams.startTime, "dd/MM/yyyy 'às' HH:mm")
  const to = formatDate(searchParams.endTime, "dd/MM/yyyy 'às' HH:mm")

  return (
    <>
      <ReportHeader />
      <View style={styles.container}>
        <Text style={styles.title}>Informações gerais sobre o relatório:</Text>

        {bulletPoints.map((topic) => (
          <>
            <View style={styles.bulletRow}>
              <Text>{'\u2022' + ' '}</Text>
              <Text style={styles.bulletTitle}>{topic.value}</Text>
            </View>

            {topic.children.map((subTopic) => (
              <>
                <View style={styles.bulletSubRow}>
                  <Text style={styles.bulletTitle}>{'\u2022' + ' '}</Text>
                  <View style={{ fontWeight: 'bold' }}>
                    <Text style={styles.bulletTitle}>{subTopic.value}</Text>
                  </View>
                </View>

                {subTopic.children.map((subSubTopic) => (
                  <View style={styles.bulletSubSubRow}>
                    <Text style={styles.bulletTitle}>{'\u2022' + ' '}</Text>
                    <Text style={styles.bulletContent}>
                      {subSubTopic.value}
                    </Text>
                  </View>
                ))}
              </>
            ))}
          </>
        ))}

        <View style={{ flexDirection: 'column', marginTop: 36 }}>
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
      <Watermark />
      <ReportFooter />
    </>
  )
}
