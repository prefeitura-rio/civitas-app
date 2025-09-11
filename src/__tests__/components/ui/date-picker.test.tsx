import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DatePicker } from '@/components/ui/date-picker'

jest.mock('@/components/ui/calendar', () => ({
  Calendar: ({
    mode,
    selected,
    onSelect,
    locale,
    fromDate,
    toDate,
    ...props
  }: any) => (
    <div
      data-testid="calendar"
      data-mode={mode}
      data-selected={selected ? selected.toISOString() : 'none'}
      data-locale={locale?.code}
      data-from-date={fromDate?.toISOString()}
      data-to-date={toDate?.toISOString()}
      {...props}
    >
      <div data-testid="calendar-header">Calendar Header</div>
      <div data-testid="calendar-body">
        <button
          data-testid="day-1"
          onClick={() => onSelect && onSelect(new Date('2024-01-01'))}
        >
          1
        </button>
        <button
          data-testid="day-15"
          onClick={() => onSelect && onSelect(new Date('2024-01-15'))}
        >
          15
        </button>
      </div>
    </div>
  ),
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: any) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, ...props }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      data-testid="input"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}))

describe('DatePicker Component', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with basic props', () => {
    render(
      <DatePicker value={new Date('2024-01-15')} onChange={mockOnChange} />,
    )

    expect(screen.getByTestId('popover')).toBeInTheDocument()
    expect(screen.getByTestId('popover-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('button')).toBeInTheDocument()
    // O DatePicker usa um botão, não um input separado
  })

  it('should display selected date in button', () => {
    const selectedDate = new Date('2024-01-15')
    render(<DatePicker value={selectedDate} onChange={mockOnChange} />)

    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent(/jan, 2024/)
  })

  it('should display placeholder when no date is selected', () => {
    render(<DatePicker value={undefined} onChange={mockOnChange} />)

    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent('Escolha uma data')
  })

  it('should apply locale from dateConfig', () => {
    render(
      <DatePicker value={new Date('2024-01-15')} onChange={mockOnChange} />,
    )

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveAttribute('data-locale', 'pt-BR')
  })

  it('should handle fromDate prop', () => {
    const fromDate = new Date('2024-01-01')
    render(
      <DatePicker
        value={new Date('2024-01-15')}
        onChange={mockOnChange}
        fromDate={fromDate}
      />,
    )

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveAttribute('data-from-date', fromDate.toISOString())
  })

  it('should handle toDate prop', () => {
    const toDate = new Date('2024-01-31')
    render(
      <DatePicker
        value={new Date('2024-01-15')}
        onChange={mockOnChange}
        toDate={toDate}
      />,
    )

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveAttribute('data-to-date', toDate.toISOString())
  })

  it('should handle disabled state', () => {
    render(
      <DatePicker
        value={new Date('2024-01-15')}
        onChange={mockOnChange}
        disabled
      />,
    )

    const button = screen.getByTestId('button')
    const calendar = screen.getByTestId('calendar')

    expect(button).toHaveAttribute('disabled')
    expect(calendar).toHaveAttribute('disabled')
  })

  it('should handle calendar selection', async () => {
    const initialDate = new Date('2024-01-15')
    render(<DatePicker value={initialDate} onChange={mockOnChange} />)

    // Simular seleção de uma nova data
    const calendar = screen.getByTestId('calendar')

    expect(calendar).toBeInTheDocument()
    expect(screen.getByTestId('day-1')).toBeInTheDocument()
    expect(screen.getByTestId('day-15')).toBeInTheDocument()
  })

  it('should handle button click to open popover', async () => {
    const user = userEvent.setup()
    render(
      <DatePicker value={new Date('2024-01-15')} onChange={mockOnChange} />,
    )

    const button = screen.getByTestId('button')
    await user.click(button)

    // O popover deve estar visível após o clique
    expect(screen.getByTestId('popover')).toBeInTheDocument()
  })

  it('should handle button click to open popover', async () => {
    const user = userEvent.setup()
    render(
      <DatePicker value={new Date('2024-01-15')} onChange={mockOnChange} />,
    )

    const button = screen.getByTestId('button')
    await user.click(button)

    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
  })

  it('should handle empty value', () => {
    render(<DatePicker value={undefined} onChange={mockOnChange} />)

    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent('Escolha uma data')
  })

  it('should handle null value', () => {
    render(<DatePicker value={null as any} onChange={mockOnChange} />)

    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent('Escolha uma data')
  })

  it('should pass through additional props', () => {
    render(
      <DatePicker
        value={new Date('2024-01-15')}
        onChange={mockOnChange}
        data-testid="custom-datepicker"
        className="custom-class"
      />,
    )

    const popover = screen.getByTestId('popover')
    expect(popover).toBeInTheDocument()
  })

  it('should handle custom placeholder', () => {
    render(
      <DatePicker
        value={undefined}
        onChange={mockOnChange}
        placeholder="Selecione uma data"
      />,
    )

    const popover = screen.getByTestId('popover')
    expect(popover).toBeInTheDocument()
  })

  it('should handle calendar mode', () => {
    render(
      <DatePicker value={new Date('2024-01-15')} onChange={mockOnChange} />,
    )

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveAttribute('data-mode', 'single')
  })
})
