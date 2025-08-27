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
