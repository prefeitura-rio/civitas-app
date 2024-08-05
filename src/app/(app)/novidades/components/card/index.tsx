import { Calendar } from 'lucide-react'

import type { Card } from '../changelog'
import { SubCard } from './components/sub-card'

export function Card({ title, subCards }: Card) {
  return (
    <>
      <h2 className="flex items-center gap-2">
        <Calendar className="inline-block" /> {title}
      </h2>

      <ul className="list-inside list-disc">
        {subCards.map((subCard) => (
          <SubCard
            title={subCard.title}
            tag={subCard.tag}
            content={subCard.content}
          />
        ))}
      </ul>
    </>
  )
}
