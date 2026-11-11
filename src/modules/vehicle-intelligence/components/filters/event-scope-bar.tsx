import { SlidersHorizontal } from 'lucide-react'

import { ScopePill } from '@/modules/vehicle-intelligence/components/filters/scope-pill'
import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import {
  copassagem,
  recorte,
} from '@/modules/vehicle-intelligence/config/recortes'
import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'
import { MASTER_GRAPH_OPTIONS_PATH } from '@/modules/vehicle-intelligence/lib/api'
import { formatNumber } from '@/modules/vehicle-intelligence/lib/format'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import {
  periodChoices,
  periodLabel,
} from '@/modules/vehicle-intelligence/lib/period'
import {
  allowed,
  DEFAULT_EVENT_SCOPE,
  SCOPE_LIMITS,
  useEventScope,
} from '@/modules/vehicle-intelligence/stores/event-scope'
import {
  cispsOfZones,
  type CrimeType,
  type MasterGraphOptions,
  zonesIn,
} from '@/modules/vehicle-intelligence/types/domain'

const ALL = '__todos__'
const MIXED = '__varios__'

/** Recorte global de fatos do perfil: uma faixa com uma pill por filtro. Em "Ver todos os fatos", a janela e o raio (ou
 * a janela entre passagens) continuam valendo; só os filtros de fato se apagam. */
export function EventScopeBar() {
  const { scope, setScope, applyToPlates, setApplyToPlates } = useEventScope()
  // Sem as opções (ainda ou por falha), as pills usam os limites da interface.
  const { data: options } = useApi<MasterGraphOptions>(
    MASTER_GRAPH_OPTIONS_PATH,
  )
  const off = !applyToPlates
  const modalities = options?.modalidades ?? DEFAULT_EVENT_SCOPE.modalidades
  const modes = (options?.deslocamentos ?? scope.deslocamentos).filter(Boolean)
  const offender =
    scope.deslocamentos.length === 0
      ? ALL
      : scope.deslocamentos.length === 1
        ? scope.deslocamentos[0]
        : MIXED
  const extra = [
    scope.somenteCarga ? 'roubo de carga' : null,
    scope.alvos.length
      ? `${scope.alvos.length} ${recorte.target.noun}${scope.alvos.length > 1 ? 's' : ''}`
      : null,
    scope.cisps.length
      ? `${scope.cisps.length} CISP${scope.cisps.length > 1 ? 's' : ''}`
      : null,
    scope.maxFactDistance
      ? `radar a até ${formatNumber(scope.maxFactDistance)} m do fato`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const minutes = (values: number[]) =>
    values.map((value) => ({ value: String(value), label: `±${value} min` }))
  const fact = scope.modalidades.length === 1 ? scope.modalidades[0] : ALL
  // Zona: a cidade inteira (sem CISP), uma zona exata ou outra seleção de CISPs.
  const zonesSelected = zonesIn(options?.zones, scope.cisps)
  const zoneValue = !scope.cisps.length
    ? ALL
    : zonesSelected.length === 1 &&
        cispsOfZones(options?.zones, zonesSelected).length ===
          scope.cisps.length
      ? zonesSelected[0]
      : MIXED
  return (
    <div
      className={`event-scope-bar${off ? ' off' : ''}`}
      role="group"
      aria-label="Recorte global dos fatos"
    >
      <span className="event-scope-title">
        <SlidersHorizontal size={14} />
        Recorte global
      </span>
      <div className="event-scope-fields">
        <ScopePill
          label="Período"
          value={String(scope.months ?? 0)}
          disabled={off}
          display={
            scope.months
              ? `${scope.months} ${scope.months === 1 ? 'mês' : 'meses'}`
              : 'Tudo'
          }
          onChange={(value) => setScope({ months: Number(value) || null })}
          items={periodChoices(options?.available_period_months).map(
            (value) => ({
              value: String(value ?? 0),
              label: periodLabel(value, options?.fact_period),
            }),
          )}
        />
        <ScopePill
          label="Janela"
          value={String(scope.eventWindow)}
          display={`±${scope.eventWindow} min`}
          onChange={(value) => setScope({ eventWindow: Number(value) })}
          items={minutes(
            allowed(
              options?.available_event_window_minutes,
              SCOPE_LIMITS.eventWindows,
            ),
          )}
        />
        {copassagem ? (
          <ScopePill
            label="Passagens"
            value={String(scope.passageWindow)}
            display={`±${scope.passageWindow} min`}
            onChange={(value) => setScope({ passageWindow: Number(value) })}
            items={minutes(
              allowed(
                options?.available_passage_window_minutes,
                SCOPE_LIMITS.passageWindows,
              ),
            )}
          />
        ) : (
          <ScopePill
            label="Raio"
            value={String(scope.radius)}
            display={`${formatNumber(scope.radius)} m`}
            onChange={(value) => setScope({ radius: Number(value) })}
            items={allowed(
              options?.available_radius_meters,
              SCOPE_LIMITS.radii,
            ).map((value) => ({
              value: String(value),
              label: `${formatNumber(value)} m`,
            }))}
          />
        )}
        {(options?.zones ?? []).length > 0 && (
          <ScopePill
            label="Zona"
            value={zoneValue}
            disabled={off}
            display={
              zoneValue === ALL
                ? 'Toda a cidade'
                : zoneValue === MIXED
                  ? `${scope.cisps.length} CISPs`
                  : zoneValue
            }
            onChange={(value) => {
              if (value !== MIXED)
                setScope({
                  cisps:
                    value === ALL ? [] : cispsOfZones(options?.zones, [value]),
                })
            }}
            items={[
              { value: ALL, label: 'Toda a cidade' },
              ...(options?.zones ?? []).map((item) => ({
                value: item.name,
                label: item.name,
              })),
              ...(zoneValue === MIXED
                ? [{ value: MIXED, label: `${scope.cisps.length} CISPs` }]
                : []),
            ]}
          />
        )}
        <ScopePill
          label="Fato"
          value={fact}
          display={fact === ALL ? 'Todos' : categoryLabel(fact)}
          disabled={off}
          onChange={(value) =>
            setScope({
              modalidades:
                value === ALL
                  ? DEFAULT_EVENT_SCOPE.modalidades
                  : [value as CrimeType],
            })
          }
          items={[
            { value: ALL, label: 'Todos os fatos' },
            ...modalities.map((value) => ({
              value,
              label: `Só ${categoryLabel(value).toLowerCase()}`,
            })),
          ]}
        />
        {modes.length > 0 && (
          <ScopePill
            label="Autor"
            value={offender}
            disabled={off}
            display={
              offender === ALL
                ? 'Qualquer'
                : offender === MIXED
                  ? `${scope.deslocamentos.length} deslocamentos`
                  : categoryLabel(offender)
            }
            onChange={(value) => {
              if (value !== MIXED)
                setScope({ deslocamentos: value === ALL ? [] : [value] })
            }}
            items={[
              { value: ALL, label: 'Qualquer deslocamento' },
              ...modes.map((value) => ({ value, label: categoryLabel(value) })),
              ...(offender === MIXED
                ? [
                    {
                      value: MIXED,
                      label: `${scope.deslocamentos.length} deslocamentos`,
                    },
                  ]
                : []),
            ]}
          />
        )}
        {extra && (
          <>
            <i className="event-scope-divider" aria-hidden="true" />
            <span
              className="event-scope-extra"
              title="Definidos no painel do grafo"
            >
              {extra} · definido no grafo
            </span>
          </>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="event-scope-toggle"
        aria-pressed={off}
        onClick={() => setApplyToPlates(off)}
        title={
          off
            ? 'Voltar a aplicar o recorte global'
            : 'Mostrar todos os fatos da placa, ignorando o recorte'
        }
      >
        {off ? 'Aplicar recorte' : 'Ver todos os fatos'}
      </Button>
    </div>
  )
}
