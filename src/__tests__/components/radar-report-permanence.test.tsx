import { render, screen } from '@testing-library/react'

import { RadarReportDocument } from '@/app/(app)/veiculos/busca-por-radar/resultado/components/report/document'
import { RadarReportDocument as EnhancedRadarReportDocument } from '@/app/(app)/veiculos/busca-por-radar/resultado-enriquecido/components/report/document'

jest.mock('@react-pdf/renderer', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Font: { register: jest.fn(), registerHyphenationCallback: jest.fn() },
  Document: 'div',
  Page: 'div',
  Text: 'span',
  View: 'div',
  Image: 'img',
}))
jest.mock('@/components/custom/report-header', () => ({
  ReportHeader: () => null,
}))
jest.mock('@/components/custom/report-footer', () => ({
  ReportFooter: () => null,
}))
jest.mock(
  '@/app/(app)/veiculos/busca-por-radar/resultado/components/report/components/cover',
  () => ({ RadarReportCover: () => null }),
)
jest.mock(
  '@/app/(app)/veiculos/busca-por-radar/resultado-enriquecido/components/report/components/cover',
  () => ({ RadarReportCover: () => null }),
)

it.each([RadarReportDocument, EnhancedRadarReportDocument])(
  'includes permanence counts and duration in PDF tables (%p)',
  (Report) => {
    const radar = {
      cetRioCode: '123',
      company: null,
      latitude: -22.9,
      longitude: -43.2,
      location: 'Rua de teste',
      district: null,
      direction: null,
      lane: null,
      lastDetectionTime: null,
      activeInLast24Hours: true,
    }
    const detection = {
      plate: 'ABC1D23',
      timestamp: '2026-11-17T10:00:00-03:00',
      speed: 0,
      equipmentCode: '123',
      location: 'Rua de teste',
      latitude: -22.9,
      longitude: -43.2,
      lane: '',
      brandModel: '',
      color: '',
      modelYear: '',
    }
    render(
      <Report
        parameters={{ from: new Date(), to: new Date(), radarIds: ['123'] }}
        data={[
          {
            location: 'Rua de teste',
            radars: [radar],
            detections: [
              {
                ...detection,
                parado: true,
                minutos_parado: 15,
                total_deteccoes_parado: 4,
              },
              { ...detection, plate: 'DEF4G56' },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('Possível permanência')).toBeInTheDocument()
    expect(screen.getByText(/5 detecções\s+15 min/)).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(
      screen.getByText(/não confirma que o veículo ficou parado/),
    ).toBeInTheDocument()
  },
)
