/* eslint-disable no-extend-native */
import { dateConfig } from '@/lib/date-config'

Date.prototype.setMaxTime = function (): Date {
  this.setHours(dateConfig.maxTime.hours)
  this.setMinutes(dateConfig.maxTime.minutes)
  this.setSeconds(dateConfig.maxTime.seconds)
  this.setMilliseconds(dateConfig.maxTime.milliseconds)

  return this
}

Date.prototype.setMinTime = function (): Date {
  this.setHours(dateConfig.defaultTime.hours)
  this.setMinutes(dateConfig.defaultTime.minutes)
  this.setSeconds(dateConfig.defaultTime.seconds)
  this.setMilliseconds(dateConfig.defaultTime.milliseconds)

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

Date.prototype.addDays = function (days: number): Date {
  const daysInMiliseconds = 1000 * 60 * 60 * 24 * days
  const newTime = this.getTime() + daysInMiliseconds

  this.setTime(newTime)

  return this
}

Date.prototype.addHours = function (hours: number): Date {
  const hoursInMiliseconds = 1000 * 60 * 60 * hours
  const newTime = this.getTime() + hoursInMiliseconds

  this.setTime(newTime)

  return this
}

Date.prototype.addMinutes = function (minutes: number): Date {
  const minutesInMiliseconds = 1000 * 60 * minutes
  const newTime = this.getTime() + minutesInMiliseconds

  this.setTime(newTime)

  return this
}
