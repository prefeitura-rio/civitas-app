import type { SubCard } from '../../../changelog'
import { Tag } from './components/tag'

export function SubCard({ title, tag, content }: SubCard) {
  return (
    <li>
      <h3 className="!mt-0 mb-4 text-xl">
        <Tag tag={tag} /> {title}
      </h3>
      <div>{content}</div>
    </li>
  )
}
