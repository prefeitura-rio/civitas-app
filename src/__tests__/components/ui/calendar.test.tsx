import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Calendar } from '@/components/ui/calendar'
import { dateConfig } from '@/lib/date-config'

jest.mock('react-day-picker', () => ({
  DayPicker: ({
    mode,
    selected,
    onSelect,
    locale,
    fromDate,
    toDate,
    numberOfMonths,
    defaultMonth,
    showOutsideDays,
    classNames,
    ...props
  }: any) => {
    const getSelectedData = () => {
      if (!selected) return 'none'
      if (Array.isArray(selected)) {
        return selected.length > 0
          ? selected[selected.length - 1].toISOString()
          : 'none'
      }
      if (typeof selected === 'object' && selected.from && selected.to) {
        return selected.to.toISOString()
      }
      if (selected.toISOString) {
        return selected.toISOString()
      }
      return 'none'
    }

    return (
      <div
        data-testid="calendar"
        data-mode={mode}
        data-selected={getSelectedData()}
        data-locale={locale?.code}
        data-from-date={fromDate?.toISOString()}
        data-to-date={toDate?.toISOString()}
        data-number-of-months={numberOfMonths}
        data-default-month={defaultMonth?.toISOString()}
        data-show-outside-days={showOutsideDays}
        data-class-names={JSON.stringify(classNames)}
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
          <button
            data-testid="day-31"
            onClick={() => onSelect && onSelect(new Date('2024-01-31'))}
          >
            31
          </button>
        </div>
      </div>
    )
  },
}))

describe('Calendar Component', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('should render with basic props', () => {
    render(<Calendar mode="single" onSelect={mockOnSelect} />)

    expect(screen.getByTestId('calendar')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-body')).toBeInTheDocument()
  })

  it('should render in single mode', () => {
    render(<Calendar mode="single" onSelect={mockOnSelect} />)

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-mode',
      'single',
    )
  })

  it('should render in range mode', () => {
    render(<Calendar mode="range" onSelect={mockOnSelect} />)

    expect(screen.getByTestId('calendar')).toHaveAttribute('data-mode', 'range')
  })

  it('should render in multiple mode', () => {
    render(<Calendar mode="multiple" onSelect={mockOnSelect} />)

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-mode',
      'multiple',
    )
  })

  it('should apply locale from dateConfig', () => {
    render(
      <Calendar
        mode="single"
        onSelect={mockOnSelect}
        locale={dateConfig.locale}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-locale',
      'pt-BR',
    )
  })

  it('should handle fromDate prop', () => {
    const fromDate = new Date('2024-01-01')
    render(
      <Calendar mode="single" onSelect={mockOnSelect} fromDate={fromDate} />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-from-date',
      fromDate.toISOString(),
    )
  })

  it('should handle toDate prop', () => {
    const toDate = new Date('2024-01-31')
    render(<Calendar mode="single" onSelect={mockOnSelect} toDate={toDate} />)

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-to-date',
      toDate.toISOString(),
    )
  })

  it('should handle numberOfMonths prop', () => {
    render(
      <Calendar mode="single" onSelect={mockOnSelect} numberOfMonths={2} />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-number-of-months',
      '2',
    )
  })

  it('should handle defaultMonth prop', () => {
    const defaultMonth = new Date('2024-06-01')
    render(
      <Calendar
        mode="single"
        onSelect={mockOnSelect}
        defaultMonth={defaultMonth}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-default-month',
      defaultMonth.toISOString(),
    )
  })

  it('should handle showOutsideDays prop', () => {
    render(
      <Calendar
        mode="single"
        onSelect={mockOnSelect}
        showOutsideDays={false}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-show-outside-days',
      'false',
    )
  })

  it('should handle custom classNames prop', () => {
    const customClassNames = { day: 'custom-day', month: 'custom-month' }
    render(
      <Calendar
        mode="single"
        onSelect={mockOnSelect}
        classNames={customClassNames}
      />,
    )

    const calendar = screen.getByTestId('calendar')
    const classNamesData = JSON.parse(
      calendar.getAttribute('data-class-names') || '{}',
    )
    expect(classNamesData.day).toBe('custom-day')
    expect(classNamesData.month).toBe('custom-month')
  })

  it('should call onSelect when a day is clicked', async () => {
    const user = userEvent.setup()
    render(<Calendar mode="single" onSelect={mockOnSelect} />)

    await user.click(screen.getByTestId('day-15'))

    expect(mockOnSelect).toHaveBeenCalledWith(new Date('2024-01-15'))
  })

  it('should handle selected date in single mode', () => {
    const selectedDate = new Date('2024-01-15')
    render(
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={mockOnSelect}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      selectedDate.toISOString(),
    )
  })

  it('should handle selected date range', () => {
    const selectedRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    }
    render(
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={mockOnSelect}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      selectedRange.to.toISOString(),
    )
  })

  it('should handle multiple selected dates', () => {
    const selectedDates = [
      new Date('2024-01-01'),
      new Date('2024-01-15'),
      new Date('2024-01-31'),
    ]
    render(
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={mockOnSelect}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      selectedDates[2].toISOString(),
    )
  })

  it('should pass through additional props', () => {
    render(
      <Calendar
        mode="single"
        onSelect={mockOnSelect}
        data-testid="custom-calendar"
        className="custom-class"
      />,
    )

    const calendar = screen.getByTestId('custom-calendar')
    expect(calendar).toHaveClass('custom-class')
  })

  it('should handle disabled state', () => {
    render(<Calendar mode="single" onSelect={mockOnSelect} disabled />)

    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveAttribute('disabled')
  })

  it('should handle initialFocus prop', () => {
    render(<Calendar mode="single" onSelect={mockOnSelect} initialFocus />)

    const calendar = screen.getByTestId('calendar')

    expect(calendar).toBeInTheDocument()
  })

  it('should handle empty selected value', () => {
    render(
      <Calendar mode="single" selected={undefined} onSelect={mockOnSelect} />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      'none',
    )
  })

  it('should handle null selected value', () => {
    render(
      <Calendar mode="single" selected={null as any} onSelect={mockOnSelect} />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      'none',
    )
  })

  it('should handle empty array for multiple mode', () => {
    render(<Calendar mode="multiple" selected={[]} onSelect={mockOnSelect} />)

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      'none',
    )
  })

  it('should handle undefined range object', () => {
    const selectedRange = {
      from: undefined,
      to: undefined,
    }
    render(
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={mockOnSelect}
      />,
    )

    expect(screen.getByTestId('calendar')).toHaveAttribute(
      'data-selected',
      'none',
    )
  })
})
