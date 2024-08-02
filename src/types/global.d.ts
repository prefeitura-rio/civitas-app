interface Date {
  setMaxTime(): Date
  setMinTime(): Date
  setCurrentTime(): Date
  setDatePreservingTime(newDate: Date): Date
}

interface String {
  capitalizeFirstLetter(): string
}
