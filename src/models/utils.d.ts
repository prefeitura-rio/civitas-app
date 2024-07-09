export type ComboboxOption = {
  value: string
  label: string
}

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  color?: string
  isChidren?: boolean
  children?: NavItem[]
}
