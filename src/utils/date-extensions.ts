/* eslint-disable no-extend-native */

// Funções utilitárias que retornam novas instâncias
export const setMaxTime = (date: Date): Date => {
  const newDate = new Date(date)
  newDate.setHours(23)
  newDate.setMinutes(59)
  newDate.setSeconds(59)
  newDate.setMilliseconds(999)
  return newDate
}

export const setMinTime = (date: Date): Date => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  return newDate
}

export const setCurrentTime = (date: Date): Date => {
  const newDate = new Date(date)
  const now = new Date()
  newDate.setHours(now.getHours())
  newDate.setMinutes(now.getMinutes())
  newDate.setSeconds(now.getSeconds())
  newDate.setMilliseconds(now.getMilliseconds())
  return newDate
}

export const setDatePreservingTime = (newDate: Date, timeDate: Date): Date => {
  const result = new Date(newDate)
  result.setHours(timeDate.getHours())
  result.setMinutes(timeDate.getMinutes())
  result.setSeconds(timeDate.getSeconds())
  result.setMilliseconds(timeDate.getMilliseconds())
  return result
}

export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date)
  const daysInMiliseconds = 1000 * 60 * 60 * 24 * days
  const newTime = newDate.getTime() + daysInMiliseconds
  newDate.setTime(newTime)
  return newDate
}

export const addHours = (date: Date, hours: number): Date => {
  const newDate = new Date(date)
  const hoursInMiliseconds = 1000 * 60 * 60 * hours
  const newTime = newDate.getTime() + hoursInMiliseconds
  newDate.setTime(newTime)
  return newDate
}

export const addMinutes = (date: Date, minutes: number): Date => {
  const newDate = new Date(date)
  const minutesInMiliseconds = 1000 * 60 * minutes
  const newTime = newDate.getTime() + minutesInMiliseconds
  newDate.setTime(newTime)
  return newDate
}

// Extensões de protótipo (mantidas para compatibilidade)
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
