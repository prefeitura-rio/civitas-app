import { cn } from '@/lib/utils'

import { TagEnum } from '../../../../changelog'

interface TagProps {
  tag: TagEnum
}

export function Tag({ tag }: TagProps) {
  let backgroundColor = ''
  let textColor = ''

  switch (tag) {
    case TagEnum.ADICIONADO:
      backgroundColor = 'bg-emerald-900'
      textColor = 'text-white'
      break

    case TagEnum.ALTERADO:
      backgroundColor = 'bg-orange-900'
      textColor = 'text-white'
      break

    case TagEnum.CORRIGIDO:
      backgroundColor = 'bg-red-900'
      textColor = 'text-white'
      break

    case TagEnum.REMOVIDO:
      backgroundColor = 'bg-slate-900'
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
