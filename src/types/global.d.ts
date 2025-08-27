declare global {
  interface Date {
    setMaxTime(): Date
    setMinTime(): Date
    setCurrentTime(): Date
    setDatePreservingTime(newDate: Date): Date
    addDays(days: number): Date
    addHours(hours: number): Date
    addMinutes(minutes: number): Date
  }

  interface String {
    capitalizeFirstLetter(): string
  }

  // Jest DOM matchers
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(...classNames: string[]): R
      toBeDisabled(): R
      toHaveTextContent(text: string | RegExp): R
    }
  }
}

export {}
