import { Text } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'

interface ReportEmptyResultProps {
  searchParams: GetCarPathRequest
}

export function ReportEmptyResult({ searchParams }: ReportEmptyResultProps) {
  const plate = searchParams.plate
  const from = format(
    new Date(searchParams.startTime),
    "dd/MM/yyyy 'às' HH:mm:ss",
  )
  const to = format(new Date(searchParams.endTime), "dd/MM/yyyy 'às' HH:mm:ss")

  return (
    <Text
      style={{
        fontFamily: 'Open Sans',
        fontSize: 11,
        textAlign: 'center',
      }}
    >
      {`A placa ${plate} NÃO foi detectada pelos radares da Prefeitura da cidade do Rio de Janeiro entre ${from} e ${to}.`}
    </Text>
  )
}
