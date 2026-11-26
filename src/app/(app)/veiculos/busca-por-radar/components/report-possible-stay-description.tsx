import { StyleSheet, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 14,
    fontSize: 11,
  },
  strong: {
    fontWeight: 600,
  },
  paragraph: {
    marginTop: 6,
    textAlign: 'justify',
    lineHeight: 1.2,
  },
})

export function ReportPossibleStayDescription() {
  return (
    <View style={styles.container}>
      <Text style={styles.strong}>Possível permanência</Text>
      <Text style={styles.paragraph}>
        Identifica detecções consecutivas da mesma placa em um equipamento de
        leitura LPR, em intervalo inferior a 10 minutos, indicando possível
        permanência (ex.: veículos parados ou estacionados). No relatório, a
        informação aparece na coluna como{' '}
        <Text style={styles.strong}>
          “Possível permanência até: [data/hora] – [quantidade] detecções”
        </Text>
        , indicando o horário da última leitura da sequência e o total de
        registros no intervalo.
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.strong}>Importante:</Text> a indicação não confirma
        que o veículo esteve parado ou estacionado no local. Ela identifica,
        objetivamente, uma sequência de leituras da mesma placa em um mesmo
        ponto ou em pontos próximos, com intervalos muito curtos entre as
        detecções.
      </Text>
    </View>
  )
}
