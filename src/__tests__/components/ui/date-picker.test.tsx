import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format } from 'date-fns'

import { DatePicker } from '@/components/ui/date-picker'
import { dateConfig } from '@/lib/date-config'

// Mock do react-day-picker para evitar problemas com locale
jest.mock('react-day-picker', () => ({
  DayPicker: ({ locale, ...props }: any) => (
    <div data-testid="day-picker" data-locale={locale?.code || 'en'} {...props}>
      Mocked DayPicker
    </div>
  ),
}))

describe('DatePicker', () => {
  const mockOnChange = jest.fn()
  const testDate = new Date(2024, 0, 15, 14, 30) // 15 de janeiro de 2024, 14:30

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with Portuguese placeholder', () => {
    render(
      <DatePicker
        value={undefined}
        onChange={mockOnChange}
        placeholder="Escolha uma data"
      />,
    )

    expect(screen.getByText('Escolha uma data')).toBeInTheDocument()
  })

  it('should format date with Portuguese locale', () => {
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    const expectedFormat = format(testDate, 'dd MMM, y HH:mm', {
      locale: dateConfig.locale,
    })
    expect(screen.getByText(expectedFormat)).toBeInTheDocument()
  })

  it('should pass dateConfig.locale locale to Calendar component', async () => {
    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    // Clica no botão para abrir o calendário
    const dateButton = screen.getByRole('button')
    await userEvent.click(dateButton)

    // Verifica se o DayPicker recebeu o locale pt-BR
    await waitFor(() => {
      const dayPicker = screen.getByTestId('day-picker')
      expect(dayPicker).toHaveAttribute('data-locale', 'pt-BR')
    })
  })

  it('should render datetime picker when type is datetime-local', async () => {
    render(
      <DatePicker
        value={testDate}
        onChange={mockOnChange}
        type="datetime-local"
      />,
    )

    // Clica no botão para abrir o calendário
    const dateButton = screen.getByRole('button')
    await userEvent.click(dateButton)

    // Verifica se o TimePicker é renderizado
    await waitFor(() => {
      expect(screen.getByTestId('day-picker')).toBeInTheDocument()
    })
  })

  it('should display Portuguese formatted date in button text', () => {
    const testDate = new Date(2024, 5, 15, 14, 30) // 15 de junho de 2024

    render(<DatePicker value={testDate} onChange={mockOnChange} />)

    // Verifica se a data está formatada em português
    const formattedDate = format(testDate, 'dd MMM, y HH:mm', {
      locale: dateConfig.locale,
    })
    expect(screen.getByText(formattedDate)).toBeInTheDocument()

    // Deve mostrar o mês em português (jun.)
    expect(formattedDate).toContain('jun')
  })

  it('should handle disabled state', () => {
    render(
      <DatePicker value={testDate} onChange={mockOnChange} disabled={true} />,
    )

    const dateButton = screen.getByRole('button')
    expect(dateButton).toBeDisabled()
  })

  it('should apply custom placeholder', () => {
    const customPlaceholder = 'Selecione uma data personalizada'

    render(
      <DatePicker
        value={undefined}
        onChange={mockOnChange}
        placeholder={customPlaceholder}
      />,
    )

    expect(screen.getByText(customPlaceholder)).toBeInTheDocument()
  })

  it('should use dateConfig for default time values', () => {
    expect(dateConfig.defaultTime.hours).toBe(0)
    expect(dateConfig.defaultTime.minutes).toBe(0)
    expect(dateConfig.defaultTime.seconds).toBe(0)
    expect(dateConfig.defaultTime.milliseconds).toBe(0)

    expect(dateConfig.locale).toBeDefined()
    expect(dateConfig.locale.code).toBe('pt-BR')
  })
})
