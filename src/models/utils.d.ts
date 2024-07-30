export type ComboboxOption = {
  value: string
  label: string
}

export interface NavItem {
  title: string
  href?: string
  icon: LucideIcon
  color?: string
  children?: NavItem[]
}

export type Coordinates = [longitude: number, latitude: number]
