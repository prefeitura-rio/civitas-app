interface Date {
  setMaxTime(): Date
  setMinTime(): Date
  setCurrentTime(): Date
  setDatePreservingTime(newDate: Date): Date
  addDays(days: number): Date
}

interface String {
  capitalizeFirstLetter(): string
}
