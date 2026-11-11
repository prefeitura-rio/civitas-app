import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'

/** Modalidades do dia com a bolinha de cada uma: "Roubo" ou "Roubo, furto". */
export function DayModalities({ modalities }: { modalities: string[] }) {
  return (
    <span className="timeline-day-modalities">
      {modalities.map((modality, index) => (
        <i
          key={modality}
          className={`timeline-modality ${modality.toLowerCase()}`}
        >
          {index
            ? categoryLabel(modality).toLowerCase()
            : categoryLabel(modality)}
          {index < modalities.length - 1 ? ',' : ''}
        </i>
      ))}
    </span>
  )
}
