import { cn } from '@/lib/utils'

import { TagType } from '../../../../changelog'

interface TagProps {
  tag: TagType
}

export function Tag({ tag }: TagProps) {
  let backgroundColor = ''
  let textColor = ''

  switch (tag) {
    case 'Adicionado':
      backgroundColor = 'bg-green-700'
      textColor = 'text-white'
      break

    case 'Alterado':
      backgroundColor = 'bg-orange-700'
      textColor = 'text-white'
      break

    case 'Corrigido':
      backgroundColor = 'bg-red-700'
      textColor = 'text-white'
      break

    case 'Removido':
      backgroundColor = 'bg-neutral-500'
      textColor = 'text-white'
      break

    default:
      break
  }
  return (
    <span className={cn('code-highlight', backgroundColor, textColor)}>
      {tag}
    </span>
  )
}
