import { ArrowLeft, Download, PlayCircle } from 'lucide-react'

import { plateColor } from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { exportEvents } from '@/modules/vehicle-intelligence/features/groups/components/profile/export-events'
import type { GroupProfileData } from '@/modules/vehicle-intelligence/types/groups'

/** O cabeçalho do perfil: voltar, o rótulo e as placas do grupo e, com o perfil pronto, o CSV e a timeline. */
export function GroupProfileHeader({
  label,
  plates,
  data,
  colors,
  onBack,
  onOpenTimeline,
}: {
  label: string | null
  plates: string[]
  data: GroupProfileData | null
  colors: Record<string, string>
  onBack: () => void
  onOpenTimeline: (day: string | null) => void
}) {
  return (
    <section className="group-profile-head">
      <button type="button" className="group-back" onClick={onBack}>
        <ArrowLeft size={15} />
        Grupos
      </button>
      <div className="group-profile-title">
        <div>
          <h2>{label ? `Grupo ${label}` : 'Grupo'}</h2>
          <div className="group-profile-plates">
            {(data?.members.map((m) => m.plate) ?? plates).map((plate, i) => (
              <span key={plate} className="group-plate large">
                <i
                  style={{ background: colors[plate] ?? plateColor(i) }}
                  aria-hidden="true"
                />
                {plate}
              </span>
            ))}
          </div>
        </div>
        {data?.ready && (
          <div className="group-profile-actions">
            <Button
              type="button"
              variant="outline"
              className="group-export"
              onClick={() => exportEvents(data)}
            >
              <Download size={15} />
              Exportar ROs (CSV)
            </Button>
            <Button
              type="button"
              className="group-timeline"
              onClick={() => onOpenTimeline(null)}
            >
              <PlayCircle size={15} />
              Timeline do grupo
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
