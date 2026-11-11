import { useEffect, useState } from 'react'

import {
  fetchOccurrenceDynamics,
  HighlightedText,
} from '@/modules/vehicle-intelligence/components/occurrence/occurrence-dynamics'

/** O relato do RO, com as placas do grupo destacadas. */
export function Narrative({
  eventId,
  plates,
}: {
  eventId: string
  plates: string[]
}) {
  const [text, setText] = useState<string | null | undefined>(undefined)
  useEffect(() => {
    const controller = new AbortController()
    fetchOccurrenceDynamics([eventId], controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setText(rows[0]?.dynamics ?? null)
      })
      .catch(() => {
        if (!controller.signal.aborted) setText(null)
      })
    return () => controller.abort()
  }, [eventId])
  return (
    <div className="group-narrative" role="cell">
      <span>Relato</span>
      {text === undefined ? (
        'Carregando o relato…'
      ) : text ? (
        <HighlightedText
          text={text}
          terms={plates.map((p) => p.toLowerCase())}
        />
      ) : (
        'Relato não informado na fonte.'
      )}
    </div>
  )
}
