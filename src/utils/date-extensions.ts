/* eslint-disable no-extend-native */
Date.prototype.setMaxTime = function (): Date {
  this.setHours(23)
  this.setMinutes(59)
  this.setSeconds(59)
  this.setMilliseconds(999)

  return this
}

Date.prototype.setMinTime = function (): Date {
  this.setHours(0)
  this.setMinutes(0)
  this.setSeconds(0)
  this.setMilliseconds(0)

  return this
}

Date.prototype.setCurrentTime = function (): Date {
  const now = new Date()
  this.setHours(now.getHours())
  this.setMinutes(now.getMinutes())
  this.setSeconds(now.getSeconds())
  this.setMilliseconds(now.getMilliseconds())

  return this
}

Date.prototype.setDatePreservingTime = function (newDate: Date): Date {
  this.setDate(newDate.getDate())
  this.setMonth(newDate.getMonth())
  this.setFullYear(newDate.getFullYear())

  return this
}
