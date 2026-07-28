import { StyleSheet, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  footer: {
    padding: 3,
    position: 'absolute',
    bottom: 24,
    left: 30,
    right: 30,
  },
  disclaimer: {
    width: '100%',
    paddingRight: 28,
    fontSize: 8.5,
    lineHeight: 1.15,
    color: '#666666',
    textAlign: 'justify',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    fontSize: 10,
    textAlign: 'right',
  },
})

export function ReportFooter() {
  return (
    <View fixed style={styles.footer}>
      <Text style={styles.disclaimer}>
        As informações aqui apresentadas são extraídas de forma automatizada e
        correspondem fielmente aos registros existentes na base de dados de
        leituras LPR, preservando sua autenticidade, integridade,
        rastreabilidade e confiabilidade, sendo este um documento descritivo dos
        dados disponíveis na data de emissão deste relatório.
      </Text>

      <Text style={styles.pageNumber} render={({ pageNumber }) => pageNumber} />
    </View>
  )
}
