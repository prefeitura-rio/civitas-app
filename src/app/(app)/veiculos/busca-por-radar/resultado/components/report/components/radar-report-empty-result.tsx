import { Font, Text } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import { dateConfig } from '@/lib/date-config'

// Register the font
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf',
})

interface ReportEmptyResultProps {
  fromDate: Date
  toDate: Date
}

export function RadarReportEmptyResult({
  fromDate,
  toDate,
}: ReportEmptyResultProps) {
  const from = format(fromDate, "d 'de' MMMM 'de' y 'às' HH:mm:ss", {
    locale: dateConfig.locale,
  })
  const to = format(toDate, "d 'de' MMMM 'de' y 'às' HH:mm:ss", {
    locale: dateConfig.locale,
  })

  return (
    <Text
      style={{
        paddingVertical: 20,
        fontFamily: 'Open Sans',
        fontSize: 11,
        textAlign: 'justify',
      }}
    >
      {`Os Radares mencionados acima NÃO detectaram veículos entre ${from} e ${to}.`}
    </Text>
  )
}
