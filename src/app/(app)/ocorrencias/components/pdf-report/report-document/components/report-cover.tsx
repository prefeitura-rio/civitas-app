import { Page, Text, View } from '@react-pdf/renderer'

import { ReportFooter } from '@/app/(app)/mapa/components/side-pannel/components/common/report-footer'
import { ReportHeader } from '@/app/(app)/mapa/components/side-pannel/components/common/report-header'

import { styles, title } from './styles'

export function ReportCover() {
  return (
    <Page style={styles.page}>
      <ReportHeader title={title} />
      <View style={styles.contentContainer}>
        <Text style={styles.h1}>Informações gerais sobre o relatório</Text>
        <Text style={styles.p}>
          Este relatório apresenta os dados extraídos do(s) hotline(s) Disque
          Denúncia e/ou 1746. O Disque-Denúncia é um dos principais serviços que
          permite às pessoas denunciarem anonimamente atividades criminosas ou
          suspeitas para as autoridades, enquanto o 1746 é o canal que concentra
          solicitações de providências ou serviços públicos para problemas
          identificados pela população.
        </Text>
        <Text style={styles.p}>
          Os resultados apresentados a seguir consideram o período de tempo
          requerido pelo solicitante do(s) hotline(s) de interesse. Além disso,
          a busca poderá considerar palavras semânticas para facilitar e
          focalizar a análise para temática de interesse.
        </Text>
        <Text style={styles.p}>
          Ao longo do documento, serão apresentadas duas análises. A primeira
          análise demonstra a dispersão das denúncias e/ou serviços pesquisados
          no mapa. A segunda análise apresenta o histórico com a localização,
          dinâmica narrada pelo denunciante, órgãos de difusão, tipos e subtipos
          e demais informações pertinentes das denúncias e/ou serviços filtrados
          pelo requerente.
        </Text>
      </View>
      <ReportFooter />
    </Page>
  )
}
