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

const methodologySteps = [
  {
    highlight: 'Recebimento da solicitação',
    text: ' contendo a identificação do veículo e o período de interesse.',
  },
  {
    highlight: 'Consulta aos registros de leitura automática de placas (LPR)',
    text: ' disponíveis no sistema CIVITAS para o período informado.',
  },
  {
    highlight: 'Identificação de todos os pontos de detecção',
    text: ' associados ao veículo de interesse.',
  },
  {
    highlight: 'Agrupamento dos pontos de detecção em viagens',
    text: ', conforme os critérios descritos na Seção 2.b.',
  },
  {
    highlight: 'Cálculo dos indicadores analíticos (KPIs)',
    text: ', conforme descritos na Seção 3.',
  },
  {
    highlight: 'Geração dos mapas e tabelas',
    text: ' contendo as viagens, seus respectivos pontos de detecção e eventuais alertas de suspeita de clonagem de placa.',
  },
]

const kpiDescriptions = [
  {
    indicator: 'Bairro com mais viagens distintas',
    description:
      'Identifica o bairro que aparece no maior número de viagens do veículo de interesse durante o período analisado. Um mesmo bairro é contabilizado apenas uma vez por viagem.',
  },
  {
    indicator: 'Local com maior número de passagens',
    description:
      'Identifica o equipamento de leitura automática de placas (LPR) que registrou o maior número de detecções do veículo de interesse durante o período analisado.',
  },
  {
    indicator: 'Bairro com mais detecções',
    description:
      'Identifica o bairro que concentrou o maior número total de pontos de detecção do veículo de interesse durante o período analisado.',
  },
  {
    indicator: 'Turno com mais detecções',
    descriptionPrefix:
      'Identifica a faixa do dia com maior concentração de detecções do veículo de interesse, considerando os períodos: ',
    descriptionHighlight:
      'Madrugada (00h00 às 05h59), Manhã (06h00 às 11h59), Tarde (12h00 às 17h59) e Noite (18h00 às 23h59).',
  },
  {
    indicator: 'Detecções por turno',
    descriptionPrefix:
      'Apresenta a distribuição das detecções do veículo de interesse entre os períodos de ',
    descriptionHighlight:
      'Madrugada (00h00 às 05h59), Manhã (06h00 às 11h59), Tarde (12h00 às 17h59) e Noite (18h00 às 23h59).',
  },
]

const limitations = [
  {
    text: 'O relatório utiliza exclusivamente os registros de leitura automática de placas (LPR) disponíveis no sistema CIVITAS durante o período consultado.',
  },
  {
    text: 'Os dados utilizados para geração deste relatório estão disponíveis apenas para registros realizados a partir de ',
    highlight: '01/06/2024.',
  },
  {
    text: 'A ausência de detecções não significa, necessariamente, que o veículo de interesse tenha circulado por determinada região, uma vez que fatores como cobertura da rede de equipamentos, falhas de leitura ou ausência de captura podem impedir o registro.',
  },
  {
    text: 'O conceito de viagem adotado neste relatório possui finalidade operacional e pode não representar exatamente um deslocamento real do veículo, uma vez que as viagens são definidas exclusivamente pelo intervalo de tempo entre detecções consecutivas.',
  },
  {
    text: 'Os pontos de detecção representam apenas os locais onde o veículo de interesse foi registrado pelos equipamentos LPR. Não é possível determinar o trajeto efetivamente percorrido entre dois pontos de detecção.',
  },
  {
    text: 'Os indicadores analíticos possuem caráter descritivo e destinam-se exclusivamente ao apoio da análise dos registros do veículo de interesse, não sendo suficientes, isoladamente, para comprovar rotas, permanência, destino ou comportamento do veículo.',
  },
  {
    text: 'A distribuição dos equipamentos de leitura automática de placas (LPR) não é homogênea entre os bairros do município, podendo influenciar o volume de detecções registrado em cada localidade.',
  },
  {
    text: 'Os alertas de suspeita de clonagem representam apenas indícios e não constituem confirmação de clonagem do veículo de interesse. Eventuais limitações técnicas inerentes ao sistema de leitura automática de placas (LPR), como diferenças de sincronização de horários entre diferentes equipamentos ou outras condições operacionais da rede de monitoramento podem ocasionar alertas sem que haja efetiva clonagem. Dessa forma, o alerta deve ser interpretado apenas como um indicativo para aprofundamento da análise.',
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
    display: 'flex',
    flexDirection: 'column',
    fontSize: 11,
  },
  paragraph: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 14,
    textAlign: 'justify',
  },
  strong: {
    fontFamily: 'Open Sans',
    fontWeight: 600,
  },
  sectionTitle: {
    fontFamily: 'Open Sans',
    fontSize: 16,
    fontWeight: 600,
    marginTop: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontFamily: 'Open Sans',
    fontSize: 16,
    fontWeight: 600,
    marginTop: 0,
    marginBottom: 6,
  },
  subsectionTitle: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: 600,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 20,
  },
  orderedList: {
    marginBottom: 18,
    paddingLeft: 20,
  },
  orderedListItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  orderedListNumber: {
    width: 16,
    fontFamily: 'Open Sans',
    fontSize: 11,
    textAlign: 'right',
  },
  orderedListText: {
    flex: 1,
    paddingLeft: 8,
    fontFamily: 'Open Sans',
    fontSize: 11,
    lineHeight: 1.5,
  },
  unorderedList: {
    marginTop: 4,
    marginBottom: 14,
    paddingLeft: 20,
  },
  unorderedListItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  unorderedBullet: {
    width: 10,
    fontFamily: 'Open Sans',
    fontSize: 11,
  },
  unorderedText: {
    flex: 1,
    fontFamily: 'Open Sans',
    fontSize: 11,
    lineHeight: 1.5,
  },
  kpiTable: {
    marginTop: 8,
    marginBottom: 14,
  },
  kpiTableHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  kpiTableRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  kpiIndicator: {
    width: 118,
    paddingRight: 8,
    fontFamily: 'Open Sans',
    fontSize: 11,
    fontWeight: 600,
  },
  kpiHeaderIndicator: {
    width: 118,
    paddingRight: 8,
    fontFamily: 'Open Sans',
    fontSize: 11,
    fontWeight: 600,
    textAlign: 'center',
  },
  kpiDescription: {
    flex: 1,
    fontFamily: 'Open Sans',
    fontSize: 11,
    lineHeight: 1.5,
  },
  kpiHeaderDescription: {
    flex: 1,
    fontFamily: 'Open Sans',
    fontSize: 11,
    fontWeight: 600,
    textAlign: 'center',
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
  emptyResultText: {
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.5,
    marginBottom: 16,
    textAlign: 'justify',
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
  const hasDetections = totalPoints > 0

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
    ? `${periodsLabels[circulationIndicators.top_time_period.period]}: ${circulationIndicators.top_time_period.detections} detecções`
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

  function renderNumberedItem(
    item: (typeof methodologySteps)[number],
    index: number,
  ) {
    return (
      <View key={item.highlight} style={styles.orderedListItem}>
        <Text style={styles.orderedListNumber}>{index + 1}.</Text>
        <Text style={styles.orderedListText}>
          <Text style={styles.strong}>{item.highlight}</Text>
          {item.text}
        </Text>
      </View>
    )
  }

  function renderLimitationItem(item: (typeof limitations)[number]) {
    return (
      <View key={item.text}>
        <View style={styles.unorderedListItem}>
          <Text style={styles.unorderedBullet}>{'\u2022'}</Text>
          <Text style={styles.unorderedText}>
            {item.text}
            {item.highlight && (
              <Text style={styles.strong}>{item.highlight}</Text>
            )}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Estrutura do Relatório</Text>

        <Text style={styles.paragraph}>
          Este relatório tem por objetivo apresentar os registros de circulação
          de um <Text style={styles.strong}>veículo de interesse</Text> no
          município do Rio de Janeiro durante o período definido pela autoridade
          solicitante, utilizando os registros de leitura automática de placas
          (LPR) disponíveis no sistema CIVITAS.
        </Text>

        <Text style={styles.paragraph}>
          Para facilitar a interpretação dos resultados, são apresentados a
          seguir a metodologia de elaboração do relatório, sua estrutura, os
          principais conceitos utilizados na análise e os indicadores analíticos
          disponíveis.
        </Text>

        <Text style={styles.paragraph}>
          A elaboração deste relatório compreende as seguintes etapas:
        </Text>
        <View style={styles.orderedList}>
          {methodologySteps.map(renderNumberedItem)}
        </View>

        <Text style={styles.sectionTitle}>Como interpretar este relatório</Text>

        <Text style={styles.subsectionTitle}>a. Ponto de detecção</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.strong}>
            Um ponto de detecção corresponde ao registro de um veículo de
            interesse
          </Text>
          , contendo o local, a data e o horário em que foi identificado por um
          equipamento de leitura automática de placas (LPR). Nos mapas, cada
          ponto recebe um número de <Text style={styles.strong}>posição</Text>,
          que indica sua ordem cronológica dentro da respectiva viagem.
        </Text>

        <View break />

        <Text style={styles.subsectionTitle}>b. Viagem</Text>
        <Text style={styles.paragraph}>
          Uma viagem corresponde ao conjunto de pontos de detecção de um veículo
          de interesse que formam um deslocamento contínuo.{' '}
          <Text style={styles.strong}>
            Os registros são agrupados em uma mesma viagem quando o intervalo
            entre um ponto de detecção e o seguinte é inferior a uma hora.
          </Text>{' '}
          Caso esse intervalo seja igual ou superior a uma hora, entende-se que
          houve uma interrupção do deslocamento, iniciando uma nova viagem. As
          viagens são apresentadas da mais recente para a mais antiga. Quando
          necessário para melhorar a visualização dos resultados, uma viagem
          poderá ser dividida em segmentos quando:
        </Text>
        <View style={styles.unorderedList}>
          <View style={styles.unorderedListItem}>
            <Text style={styles.unorderedBullet}>{'\u2022'}</Text>
            <Text style={styles.unorderedText}>
              possuir mais de{' '}
              <Text style={styles.strong}>10 pontos de detecção</Text>; ou
            </Text>
          </View>
          <View style={styles.unorderedListItem}>
            <Text style={styles.unorderedBullet}>{'\u2022'}</Text>
            <Text style={styles.unorderedText}>
              existirem dois pontos consecutivos separados por distância
              superior a <Text style={styles.strong}>6 km</Text>.
            </Text>
          </View>
        </View>

        <Text style={styles.subsectionTitle}>
          c. Alerta de suspeita de clonagem
        </Text>
        <Text style={styles.paragraph}>
          O relatório apresenta um alerta automático quando o intervalo de tempo
          entre duas detecções consecutivas é incompatível com a distância entre
          elas. O alerta é gerado quando a velocidade média estimada supera{' '}
          <Text style={styles.strong}>
            110 km/h em linha reta entre os pontos de detecção e a distância
            entre duas detecções subsequentes é maior que 1 km.
          </Text>{' '}
          Esse alerta possui caráter indicativo e não confirma a existência de
          clonagem do veículo de interesse, cabendo à autoridade competente
          fazer a apuração dos fatos.
        </Text>

        <View break />

        <Text style={styles.sectionTitle}>Indicadores Analíticos (KPIs)</Text>
        <Text style={styles.paragraph}>
          Os indicadores analíticos resumem os principais padrões identificados
          nos registros do veículo de interesse durante o período consultado.
        </Text>

        <View style={styles.kpiTable}>
          <View style={styles.kpiTableHeader}>
            <Text style={styles.kpiHeaderIndicator}>Indicador</Text>
            <Text style={styles.kpiHeaderDescription}>Descrição</Text>
          </View>
          {kpiDescriptions.map((item) => (
            <View key={item.indicator} style={styles.kpiTableRow}>
              <Text style={styles.kpiIndicator}>{item.indicator}</Text>
              <Text style={styles.kpiDescription}>
                {'description' in item
                  ? item.description
                  : item.descriptionPrefix}
                {'descriptionHighlight' in item && (
                  <Text style={styles.strong}>{item.descriptionHighlight}</Text>
                )}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Limitações</Text>
        <Text style={styles.paragraph}>
          As informações apresentadas neste relatório devem ser interpretadas
          considerando as seguintes limitações:
        </Text>
        <View style={styles.unorderedList}>
          {limitations.slice(0, 2).map(renderLimitationItem)}
        </View>

        <View break />

        <View style={styles.unorderedList}>
          {limitations.slice(2).map(renderLimitationItem)}
        </View>

        <View break />

        <Text style={styles.resultsTitle}>Resultados</Text>

        {!hasDetections && (
          <Text style={styles.emptyResultText}>
            {`A placa ${searchParams.plate} NÃO foi detectada pelos equipamentos de leitura de placa (LPR) da Prefeitura da cidade do Rio de Janeiro entre ${from} e ${to}.`}
          </Text>
        )}

        <View style={{ flexDirection: 'column', marginTop: 0 }}>
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
            'Bairro com mais viagens distintas:',
            neighborhoodWithMostDistinctTripsText,
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
        Cerco Eletrônico.
      </Text>
    </>
  )
}
