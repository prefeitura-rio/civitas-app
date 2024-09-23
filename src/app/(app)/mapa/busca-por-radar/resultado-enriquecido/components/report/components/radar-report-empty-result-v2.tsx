import { Text } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import React from 'react'

interface ReportEmptyResultProps {
  fromDate: Date
  toDate: Date
}

export function RadarReportEmptyResult({
  fromDate,
  toDate,
}: ReportEmptyResultProps) {
  const from = format(fromDate, "d 'de' MMMM 'de' y 'às' HH:mm:ss", {
    locale: ptBR,
  })
  const to = format(toDate, "d 'de' MMMM 'de' y 'às' HH:mm:ss", {
    locale: ptBR,
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
