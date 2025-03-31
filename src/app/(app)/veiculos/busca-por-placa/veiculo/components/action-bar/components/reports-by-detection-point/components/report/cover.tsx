import '@/utils/string-extensions'

import { Font, StyleSheet, Text, View } from '@react-pdf/renderer'

type BulletPoint = {
  value: string
  children?: BulletPoint[]
}

const bulletPoints: BulletPoint[] = [
  {
    value: 'Parâmetros de busca:',
    children: [
      {
        value: 'Intervalo de tempo:',
        children: [
          {
            value:
              'As buscas por placas conjuntas podem ser feitas até cinco minutos antes e cinco minutos depois da passagem da placa principal monitorada. A escolha dos parâmetros é feita pelo solicitante da informação. Quando não há informação sobre o período de busca na solicitação, o operador da Civitas utiliza o intervalo padrão definido nas diretrizes operacionais internas (três minutos antes e três minutos depois e de até 50 placas).',
          },
        ],
      },
      {
        value: 'Quantidade de placas conjuntas por buscas:',
        children: [
          {
            value:
              'São identificadas no máximo 50 placas antes e 50 placas depois da placa principal monitorada.',
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
    value: 'Como ler o relatório:',
    children: [
      {
        value:
          'O relatório é disposto em duas partes. Na primeira parte, consta um ranking com a frequência com que cada placa conjunta aparece junto à placa monitorada durante o tempo determinado nas buscas. Nesta parte, as placas são classificadas de forma decrescente a partir da quantidade de vezes que passavam junto à placa monitorada.',
      },
      {
        value:
          'A segunda parte é composta por tabelas que apresentam em ordem cronológica todas as placas detectadas que passaram antes e depois da placa principal monitorada por grupo de radar.',
      },
      {
        value:
          'O relatório apresenta tabelas com linhas e colunas. A linha grifada em amarelo representa a placa principal monitorada na qual pretende-se buscar as placas conjuntas.',
      },
      {
        value:
          'Ao lado da listagem com cada placa, na coluna à direita, é apresentado a quantidade de vezes (ocorrências) que cada placa foi registrada em conjunto com a placa monitorada.',
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
              'A falta de registro de uma placa não significa, necessariamente, que o veículo não passou pelo local. A leitura de OCR pode ser inviabilizada em algumas circunstâncias, tais como: mau estado de conservação das placas, objetos obstruindo as câmeras de leitura, condições climáticas, período de inatividade do equipamento entre outros.',
          },
          {
            value:
              'O relatório não é exaustivo e a falta de registro de uma determinada placa não é determinante para comprovar que não houve a passagem naquela localidade.',
          },
          {
            value:
              'Quando o radar não consegue, por qualquer razão, fazer a leitura completa ou parcial da placa, mas registra a passagem de um veículo, a linha na planilha será exibida com marcação tracejada ou conterá os caracteres parciais que puderam ser identificados pelo equipamento.',
          },
        ],
      },
      {
        value: 'Distância entre radares:',
        children: [
          {
            value:
              'O relatório não indica trajetos percorridos entre as detecções.',
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

export function CoverDisclaimer() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Informações gerais sobre o relatório</Text>
      <Text style={styles.bulletTitle}>Estrutura do relatório:</Text>
      <Text style={styles.normalBulletTitle}>
        O relatório identifica placas de veículos que passaram junto a uma placa
        principal monitorada (Placas conjuntas). A identificação é feita dentro
        de um intervalo de tempo determinado pela investigação a partir dos
        parâmetros de busca no sistema. O relatório também aponta a frequência
        com que as placas conjuntas foram detectadas junto à placa principal
        monitorada. A apresentação do resultado se dá por ordem decrescente de
        passagens conjuntas. Este documento é gerado automaticamente pelo
        sistema, sem interferência humana. Todo esse documento é auditável.
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
                    topic.value === 'Radares e localização:' ||
                    topic.value === 'Como ler o relatório:'
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
    </View>
  )
}
