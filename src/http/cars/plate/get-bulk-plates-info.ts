import { getPlateInfo } from './get-plate-info'

type Vehicle = {
  plate: string
  brandModel: string
  modelYear: string
  color: string
}

async function getBasicPlateInfo(plate: string) {
  try {
    const data = await getPlateInfo(plate)

    return {
      plate,
      brandModel: data.marcaModelo,
      color: data.cor,
      modelYear: data.anoModelo,
    } as Vehicle
  } catch (error) {
    return {
      plate,
      brandModel: 'ERRO',
      color: 'ERRO',
      modelYear: 'ERRO',
    }
  }
}

export async function getBulkPlatesInfo(plates: string[], progress?: (progress: number) => void) {
  const vehicles: Promise<Vehicle>[] = []

  for (let i = 0; i < plates.length; i++) {
    const vehicle = getBasicPlateInfo(plates[i])
    vehicles.push(vehicle)
    if (i % 50 === 0) {
      await Promise.all(vehicles)
      progress?.(i/plates.length)
    }
  }
  const result = await Promise.all(vehicles)

  return result
}
