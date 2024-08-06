import type { SubCard } from '../../../changelog'
import { Tag } from './components/tag'

export function SubCard({ title, tag, content }: SubCard) {
  return (
    <>
      <li>
        <h3 className="inline-block">
          <Tag tag={tag} /> {title}
        </h3>
      </li>
      <ul>
        <li className="list-none">{content}</li>
      </ul>
    </>
  )
}
