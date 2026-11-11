/**
 * Motos de rotina parecida: a mesma seção no perfil da placa (as 10 mais parecidas com ela) e no perfil do grupo (as 10
 * de fora do grupo mais parecidas com algum membro). Rotina = onde e quando a moto é lida, onde começa e termina o dia e
 * o ritmo da semana (`analise/rotina.py`). Ao lado, os sinais que não entram na conta: dias juntas, RO, base, grupo.
 */
import '@/modules/vehicle-intelligence/components/groups/groups.css'

import { type ReactNode, useMemo } from 'react'

import { formatSimilarity } from '@/modules/vehicle-intelligence/components/groups/group-text'
import {
  PlateButton,
  PlateTags,
} from '@/modules/vehicle-intelligence/components/groups/plate-marks'
import {
  groupsPath,
  useGroupFilters,
} from '@/modules/vehicle-intelligence/features/groups/api'
import {
  routineGroupPath,
  routineSimilarPath,
} from '@/modules/vehicle-intelligence/features/groups/routines/api'
import type {
  RoutineData,
  RoutineNeighbor,
  RoutineShared,
} from '@/modules/vehicle-intelligence/features/groups/routines/types'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import {
  formatDayMonth,
  formatDayMonthYear,
} from '@/modules/vehicle-intelligence/lib/dates'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import { titleCaseText } from '@/modules/vehicle-intelligence/lib/labels'
import type { GroupsData } from '@/modules/vehicle-intelligence/types/groups'

function sharedText(shared: RoutineShared): ReactNode {
  const place = shared.place ? titleCaseText(shared.place) : ''
  const when = <span className="routine-when">{shared.when}</span>
  switch (shared.kind) {
    case 'LF':
      return (
        <>
          {place}, {when}
        </>
      )
    case 'IN':
      return `começa o dia em ${place}`
    case 'FI':
      return `termina o dia em ${place}`
    case 'HS':
      return <>{when} (hora da semana)</>
  }
}

/**
 * Placa → rótulo do grupo (G1, G2…) na lista de grupos com os filtros da página de grupos. Sem a lista (erro), as placas
 * ficam sem o rótulo do grupo.
 */
function useGroupLabels(): Map<string, string> {
  const filters = useGroupFilters()
  const { data } = useApi<GroupsData>(groupsPath(filters))
  return useMemo(
    () =>
      new Map(
        (data?.groups ?? []).flatMap((g) =>
          g.members.map((m) => [m.plate, g.label] as const),
        ),
      ),
    [data],
  )
}

function NeighborRow({
  neighbor,
  forGroup,
  groupLabel,
  onOpenPlate,
}: {
  neighbor: RoutineNeighbor
  forGroup: boolean
  groupLabel?: string
  onOpenPlate: (plate: string) => void
}) {
  const [closest, ...others] = neighbor.similar_to ?? []
  return (
    <div role="row" className="group-table-row">
      <span role="cell">
        <span className="list-plate-tags">
          <PlateButton plate={neighbor.plate} onOpen={onOpenPlate} />
          <PlateTags plate={neighbor.plate} cited={neighbor.cited} />
          {groupLabel && (
            <span
              className="group-table-label"
              title="Membro de grupo na página de grupos (mesmos filtros)"
            >
              {groupLabel}
            </span>
          )}
        </span>
        <small>
          {pluralize(neighbor.days, 'dia lido', 'dias lidos')} ·{' '}
          {formatDayMonth(neighbor.first_read)}–
          {formatDayMonth(neighbor.last_read)}
        </small>
        {neighbor.double_read && (
          <small
            className="routine-double"
            title="Placa a 1 caractere da consultada, nunca juntas: provável erro de leitura (OCR) da mesma moto"
          >
            provável leitura errada da mesma placa
          </small>
        )}
      </span>
      <span role="cell" className="num light">
        {formatSimilarity(neighbor.cosine)}
      </span>
      <span role="cell" className="routine-common">
        {neighbor.shared.map((shared) => (
          <span key={`${shared.kind}-${shared.place}-${shared.when}`}>
            <span>{sharedText(shared)}</span>
            <b>{Math.round(shared.share * 100)}%</b>
          </span>
        ))}
      </span>
      <span
        role="cell"
        className={`num${neighbor.days_together ? ' light' : ' dim'}`}
      >
        {pluralize(neighbor.days_together, 'dia', 'dias')}
        <small>de {formatNumber(neighbor.days_in_common)} em comum</small>
      </span>
      <span role="cell" className={`num${neighbor.events ? '' : ' dim'}`}>
        {formatNumber(neighbor.events)}
      </span>
      <span role="cell">{neighbor.base ?? <span className="dim">—</span>}</span>
      {forGroup && (
        <span role="cell">
          {closest ?? '—'}
          {others.length > 0 && <small>e {others.join(', ')}</small>}
        </span>
      )}
    </div>
  )
}

/** A seção: `plates` com uma placa no perfil da placa; com as do grupo (`forGroup`) no perfil do grupo. */
export function RoutineNeighbors({
  plates,
  forGroup = false,
  onOpenPlate,
}: {
  plates: string[]
  forGroup?: boolean
  onOpenPlate: (plate: string) => void
}) {
  const path = forGroup
    ? routineGroupPath(plates)
    : routineSimilarPath(plates[0])
  const groupLabels = useGroupLabels()
  const routine = useApi<RoutineData>(path, {
    fallbackError: 'Falha ao comparar as rotinas',
  })
  // Outra placa ou outro grupo: a comparação anterior sai da tela enquanto a nova não chega.
  const data = routine.dataPath === path ? routine.data : null
  const { error } = routine
  const neighbors = useMemo(() => data?.neighbors ?? [], [data])

  if (error)
    return (
      <div className="routine-similar">
        <p className="list-empty" role="alert">
          {error}
        </p>
      </div>
    )
  if (!data)
    return (
      <div className="routine-similar">
        <p className="list-empty" role="status">
          Comparando a rotina com as motos lidas nos últimos meses…
        </p>
      </div>
    )
  if (!data.ready)
    return (
      <div className="routine-similar">
        <p className="list-empty">
          {data.reason}
          {data.build_command && (
            <>
              {' '}
              <code>{data.build_command}</code>
            </>
          )}
        </p>
      </div>
    )
  const period = data.window
    ? `${formatDayMonthYear(data.window.start)} a ${formatDayMonthYear(data.window.end)}`
    : ''
  const gallery = formatNumber(data.parameters?.gallery ?? 0)
  const minimumDays = data.parameters?.minimum_days ?? 4
  return (
    <div className="routine-similar">
      <p className="routine-legend">
        {forGroup
          ? `Para cada membro, as ${data.parameters?.per_member ?? 30} motos de rotina mais parecida entre ${gallery} com ${minimumDays}+ dias lidos de ${period}; aqui as 10 mais parecidas de fora do grupo.`
          : `Entre ${gallery} motos com ${minimumDays}+ dias lidos de ${period}. ${data.plate} tem ${pluralize(data.days ?? 0, 'dia lido', 'dias lidos')} no período.`}
        {forGroup &&
          (data.without_routine?.length ?? 0) > 0 &&
          ` Sem rotina comparável (menos de ${minimumDays} dias lidos): ${data.without_routine!.join(', ')}.`}
      </p>
      {neighbors.length === 0 ? (
        <p className="list-empty">
          {data.reason ?? 'Nenhuma moto de rotina parecida.'}
        </p>
      ) : (
        <div
          className={`group-table group-table-routine${forGroup ? ' with-group' : ''}`}
          role="table"
          aria-label="Motos de rotina parecida"
        >
          <div className="group-table-head top" role="row">
            {[
              'Placa',
              'Semelhança',
              'O que têm em comum',
              'Juntas',
              'ROs',
              'Base',
              ...(forGroup ? ['Parecida com'] : []),
            ].map((title, i) => (
              <span
                key={title}
                role="columnheader"
                className={[1, 3, 4].includes(i) ? 'num' : undefined}
              >
                {title}
              </span>
            ))}
          </div>
          {neighbors.map((neighbor) => (
            <NeighborRow
              key={neighbor.plate}
              neighbor={neighbor}
              forGroup={forGroup}
              groupLabel={groupLabels.get(neighbor.plate)}
              onOpenPlate={onOpenPlate}
            />
          ))}
        </div>
      )}
      {data.methodology && (
        <p className="routine-note">
          {data.methodology.csls} Juntas: dias em que passaram no mesmo local
          com até 3 min de diferença (de quantos dias as duas foram lidas).{' '}
          {data.methodology.evidence} {data.methodology.warning}
        </p>
      )}
    </div>
  )
}
