import { Text } from '@react-pdf/renderer'
import { format } from 'date-fns'
import React from 'react'

import type { GetCarPathRequest } from '@/http/cars/path/get-car-path'

import { ReportFooter } from './report-footer'
import { ReportHeader } from './report-header'

interface ReportEmptyResultProps {
  searchParams: GetCarPathRequest
}

export function ReportEmptyResult({ searchParams }: ReportEmptyResultProps) {
  const plate = searchParams.placa
  const from = format(new Date(searchParams.startTime), "dd/MM/yyyy 'às' HH:mm")
  const to = format(new Date(searchParams.endTime), "dd/MM/yyyy 'às' HH:mm")

  return (
    <>
      <ReportHeader />
      <Text
        style={{
          paddingVertical: 20,
          fontFamily: 'Open Sans',
          fontSize: 11,
          textAlign: 'center',
        }}
      >
        {`A placa ${plate} NÃO foi detectada pelos radares da Prefeitura da cidade do Rio de Janeiro entre ${from} e ${to}.`}
      </Text>
      <ReportFooter />
    </>
  )
}
