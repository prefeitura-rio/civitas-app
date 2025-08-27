import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { DatePickerWithRange } from '@/components/custom/date-range-picker'

// Mock do react-day-picker
jest.mock('react-day-picker', () => ({
  DayPicker: ({ locale, ...props }: any) => (
    <div
      data-testid="day-picker-range"
      data-locale={locale?.code || 'en'}
      {...props}
    >
      Mocked DayPicker Range
    </div>
  ),
}))

describe('DatePickerWithRange', () => {
  const mockOnChange = jest.fn()
  const testRange = {
    from: new Date(2024, 0, 15, 9, 0), // 15 de janeiro de 2024, 09:00
    to: new Date(2024, 0, 20, 18, 0), // 20 de janeiro de 2024, 18:00
  }

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with Portuguese placeholder', () => {
    render(
      <DatePickerWithRange
        value={undefined}
        onChange={mockOnChange}
        placeholder="Selecione um período"
      />,
    )

    expect(screen.getByText('Selecione um período')).toBeInTheDocument()
  })

  it('should format date range with Portuguese locale', () => {
    render(
      <DatePickerWithRange
        value={testRange}
        onChange={mockOnChange}
        timePicker={true}
      />,
    )

    const fromFormatted = format(testRange.from, 'dd MMM, y HH:mm', {
      locale: ptBR,
    })
    const toFormatted = format(testRange.to, 'dd MMM, y HH:mm', {
      locale: ptBR,
    })

    expect(
      screen.getByText(
        new RegExp(fromFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        new RegExp(toFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ),
    ).toBeInTheDocument()
  })

  it('should pass ptBR locale to Calendar component', async () => {
    render(<DatePickerWithRange value={testRange} onChange={mockOnChange} />)

    // Clica no botão para abrir o calendário
    const dateButton = screen.getByRole('button')
    await userEvent.click(dateButton)

    // Verifica se o DayPicker recebeu o locale pt-BR
    await waitFor(() => {
      const dayPicker = screen.getByTestId('day-picker-range')
      expect(dayPicker).toHaveAttribute('data-locale', 'pt-BR')
    })
  })

  it('should show Portuguese months in date range', () => {
    const testRangeJune = {
      from: new Date(2024, 5, 10, 9, 0), // 10 de junho de 2024
      to: new Date(2024, 5, 15, 18, 0), // 15 de junho de 2024
    }

    render(
      <DatePickerWithRange
        value={testRangeJune}
        onChange={mockOnChange}
        timePicker={false}
      />,
    )

    // Verifica se os meses estão em português
    const fromFormatted = format(testRangeJune.from, 'dd MMM, y', {
      locale: ptBR,
    })
    const toFormatted = format(testRangeJune.to, 'dd MMM, y', { locale: ptBR })

    // Deve conter 'jun' (junho em português)
    expect(fromFormatted).toContain('jun')
    expect(toFormatted).toContain('jun')
  })

  it('should render without time picker when timePicker is false', () => {
    render(
      <DatePickerWithRange
        value={testRange}
        onChange={mockOnChange}
        timePicker={false}
      />,
    )

    const fromFormatted = format(testRange.from, 'dd MMM, y', { locale: ptBR })
    const toFormatted = format(testRange.to, 'dd MMM, y', { locale: ptBR })

    expect(
      screen.getByText(
        new RegExp(fromFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        new RegExp(toFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ),
    ).toBeInTheDocument()
  })

  it('should handle single date selection', () => {
    const singleDateRange = {
      from: new Date(2024, 0, 15, 9, 0),
      to: undefined,
    }

    render(
      <DatePickerWithRange
        value={singleDateRange}
        onChange={mockOnChange}
        timePicker={true}
      />,
    )

    const fromFormatted = format(singleDateRange.from, 'dd MMM, y HH:mm', {
      locale: ptBR,
    })
    expect(
      screen.getByText(
        new RegExp(fromFormatted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ),
    ).toBeInTheDocument()
  })

  it('should display Portuguese labels for time inputs', async () => {
    render(
      <DatePickerWithRange
        value={testRange}
        onChange={mockOnChange}
        timePicker={true}
      />,
    )

    // Clica no botão para abrir o calendário
    const dateButton = screen.getByRole('button')
    await userEvent.click(dateButton)

    // Verifica se os labels em português estão presentes
    await waitFor(() => {
      expect(screen.getByText('Início:')).toBeInTheDocument()
    })
  })
})
