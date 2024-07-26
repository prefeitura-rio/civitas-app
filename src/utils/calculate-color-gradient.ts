import type { Point } from '@/models/entities'

export function calculateColorInGradient(point: Point) {
  const startTime = new Date(point.startTime)
  const endTime = new Date(point.endTime || point.startTime)

  const diff = (endTime.getTime() - startTime.getTime()) / 1000 / 60 // difference in minutes

  const percent = diff / 60

  const color1 = { red: 97, green: 175, blue: 239 }
  const color2 = { red: 238, green: 38, blue: 47 }

  const result = {
    red: color1.red + percent * (color2.red - color1.red),
    green: color1.green + percent * (color2.green - color1.green),
    blue: color1.blue + percent * (color2.blue - color1.blue),
  }

  return [result.red, result.green, result.blue] as [number, number, number]
}
