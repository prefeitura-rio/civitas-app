/**
 * Como a placa aparece nas telas de grupos e territórios: a cor de cada membro, o ponto, os sinais em texto, as
 * etiquetas e o botão que abre o perfil.
 */
import { CercoBadge } from '@/modules/vehicle-intelligence/components/plate/cerco-badge'

/** Cores por placa (paleta categórica validada: ordem fixa dos membros, sem repetir). Iguais no grafo, no mapa e nos ROs. */
export const PLATE_COLORS = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#4a3aa7',
  '#e34948',
  '#008300',
]
export const plateColor = (index: number) =>
  PLATE_COLORS[index % PLATE_COLORS.length]

/** Semente em ciano, parceira em cinza (grafo do cartão e pontos das listas). */
export const SEED_COLOR = '#18c7dd'
export const PARTNER_COLOR = '#61757a'

/** Ponto da placa: ciano para semente, cinza para parceira (ou a cor da placa, no perfil); anel vermelho = Cerco. */
export function PlateDot({
  seed,
  cerco = false,
  color,
  size = 8,
  background = '#111616',
}: {
  seed?: boolean
  cerco?: boolean
  color?: string
  size?: number
  background?: string
}) {
  return (
    <i
      className="group-point"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: color ?? (seed ? SEED_COLOR : PARTNER_COLOR),
        boxShadow: cerco
          ? `0 0 0 2px ${background}, 0 0 0 3.5px #f04438`
          : 'none',
      }}
    />
  )
}

/** Anel rosa tracejado da placa citada no relato (o mesmo do grafo). */
export const CitedRing = () => (
  <i className="group-ring-cited" aria-hidden="true" />
)

/** Sinais em texto: Cerco em vermelho e "Citada no relato" em rosa, com o anel tracejado. */
export function PlateMarks({
  cerco,
  cited,
  cercoLabel = 'Cerco',
  cercoRing = false,
}: {
  cerco: boolean
  cited: boolean
  cercoLabel?: string
  cercoRing?: boolean
}) {
  if (!cerco && !cited) return null
  return (
    <span className="group-signals">
      {cerco && (
        <span
          className="group-signal-cerco"
          title="Monitorada hoje no Cerco Digital"
        >
          {cercoRing && <i className="group-ring-cerco" aria-hidden="true" />}
          {cercoLabel}
        </span>
      )}
      {cited && (
        <span
          className="group-signal-cited"
          title="Citada no relato como veículo do autor ou de apoio"
        >
          <CitedRing />
          Citada no relato
        </span>
      )}
    </span>
  )
}

/** Etiquetas das tabelas do território e de Começos e fins: as do ranking de placas correlatas (CERCO, CITADA NO RELATO);
 * nenhuma quando a placa não é citada nem está no Cerco. */
export function PlateTags({ plate, cited }: { plate: string; cited: boolean }) {
  return (
    <>
      <CercoBadge plate={plate} className="signal-chip signal-cerco">
        <i aria-hidden="true" />
        CERCO
      </CercoBadge>
      {cited && (
        <span
          className="signal-chip signal-cited"
          title="Citada no relato como veículo do autor ou de apoio"
        >
          <i aria-hidden="true" />
          CITADA NO RELATO
        </span>
      )}
    </>
  )
}

/** A placa em monoespaçada e sublinhada, que abre o perfil da placa (tabelas do território e Começos e fins). */
export function PlateButton({
  plate,
  onOpen,
}: {
  plate: string
  onOpen: (plate: string) => void
}) {
  return (
    <button
      type="button"
      className="group-plate underlined list-plate"
      onClick={() => onOpen(plate)}
    >
      {plate}
    </button>
  )
}
