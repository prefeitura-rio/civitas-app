import {
  type PlateOrigin,
  plateOrigin,
} from '@/modules/vehicle-intelligence/lib/plate-origin'

/** Tom da etiqueta: a UF das câmeras (RJ) fica neutra; outra UF, divergência entre as fontes e série sem UF chamam atenção. */
export function originTone(
  origin: PlateOrigin,
): 'local' | 'other' | 'divergent' | 'alert' {
  if (origin.kind === 'sem-uf' || origin.kind === 'fora-do-padrao')
    return 'alert'
  if (origin.kind === 'divergente') return 'divergent'
  return origin.isLocal ? 'local' : 'other'
}

/** UF de origem da placa (a que emitiu a placa, pelas três primeiras letras), igual no ranking, no grafo, na busca e no perfil. */
export function PlateOriginBadge({
  plate,
  className = 'signal-chip',
}: {
  plate: string
  className?: string
}) {
  const origin = plateOrigin(plate)
  return (
    <span
      className={`${className} signal-uf ${originTone(origin)}`}
      title={`Origem da placa: ${origin.description}`}
      aria-label={`Origem da placa: ${origin.description}`}
    >
      {origin.code}
    </span>
  )
}
