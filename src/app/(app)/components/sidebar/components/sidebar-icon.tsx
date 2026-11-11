import { owl } from '@lucide/lab'
import { Icon, icons, type LucideProps } from 'lucide-react'

/** Icons from Lucide Lab (`@lucide/lab`), which are not part of `lucide-react`. */
export const labIcons = {
  Owl: owl,
} as const

export type SidebarIconName = keyof typeof icons | keyof typeof labIcons

function isLabIcon(name: SidebarIconName): name is keyof typeof labIcons {
  return name in labIcons
}

export function SidebarIcon({
  name,
  ...props
}: { name: SidebarIconName } & Omit<LucideProps, 'ref'>) {
  if (isLabIcon(name)) {
    return <Icon iconNode={labIcons[name]} {...props} />
  }
  const LucideIcon = icons[name]
  return <LucideIcon {...props} />
}
