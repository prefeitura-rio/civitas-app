import type { MouseEvent } from 'react'

import type { OpenSearchedPlate } from '@/modules/vehicle-intelligence/components/plate/plate-search'
import {
  appearsIn,
  blockedReason,
  destinationIn,
  profileHref,
  windowLabel,
} from '@/modules/vehicle-intelligence/components/plate/plate-search-logic'
import {
  type Recorte,
  recorteAtual,
} from '@/modules/vehicle-intelligence/config/recortes'
import {
  formatNumber,
  pluralize,
} from '@/modules/vehicle-intelligence/lib/format'
import type {
  PlateSearchData,
  PlateSearchItem,
} from '@/modules/vehicle-intelligence/types/domain'

/** Os números de uma placa achada num recorte e o link para o perfil nele. */
export function RecorteCell({
  item,
  recorte,
  criteria,
  onOpenPlate,
}: {
  item: PlateSearchItem
  recorte: Recorte
  criteria: PlateSearchData['criterios'][string] | undefined
  onOpenPlate: OpenSearchedPlate
}) {
  const counts = item.recortes[recorte.id]
  const destination = destinationIn(item, recorte.id)
  const current = recorte.id === recorteAtual
  const details = appearsIn(counts)
    ? [
        counts.fatos_perfil !== counts.fatos &&
          criteria &&
          `${formatNumber(counts.fatos_perfil)} na janela padrão do perfil (${windowLabel(criteria.perfil)})`,
        counts.vitima > 0 &&
          `vítima em ${pluralize(counts.vitima, 'fato', 'fatos')}`,
        counts.citada > 0 &&
          `citada em ${pluralize(counts.citada, 'RO', 'ROs')}`,
        counts.dias > 0 &&
          pluralize(counts.dias, 'dia de circulação', 'dias de circulação'),
      ]
        .filter(Boolean)
        .join(' · ')
    : null
  const summary = !appearsIn(counts)
    ? 'Não aparece'
    : counts.fatos > 0
      ? pluralize(counts.fatos, 'fato ligado', 'fatos ligados')
      : 'Sem fatos ligados'
  const content = (
    <>
      <span className="plate-search-recorte-name">
        {recorte.label}
        {current && <em>atual</em>}
      </span>
      <strong>{summary}</strong>
      {details && <small>{details}</small>}
    </>
  )
  if (!destination) {
    return (
      <span
        className="plate-search-recorte is-empty"
        title={
          blockedReason(item) ??
          `${item.placa} não tem fatos nem circulação em ${recorte.label}.`
        }
      >
        {content}
      </span>
    )
  }
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    // Recorte ativo: navegação do app (o botão Voltar volta à tela de origem); outros recortes seguem o link.
    if (
      !current ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    onOpenPlate(item.placa, destination.analysis)
  }
  // Em "Ver todos os fatos" a janela e o raio (ou as passagens) da barra do perfil valem: trocá-los mostra o resto.
  const larger = criteria
    ? [
        criteria.grafo.janela_min !== criteria.perfil.janela_min &&
          `Janela ±${criteria.grafo.janela_min} min`,
        criteria.grafo.passagem_min !== criteria.perfil.passagem_min &&
          `Passagens ±${criteria.grafo.passagem_min} min`,
        criteria.grafo.raio_m !== criteria.perfil.raio_m &&
          `Raio ${formatNumber(criteria.grafo.raio_m ?? 0)} m`,
      ]
        .filter(Boolean)
        .join(' e ')
    : ''
  const facts = criteria
    ? ` Fatos ligados no grafo inteiro, sem filtros: ${windowLabel(criteria.grafo)}.` +
      (counts.fatos_perfil !== counts.fatos
        ? ` O perfil abre em ${windowLabel(criteria.perfil)}; para ver todos, escolha ${larger} na barra do recorte.`
        : '')
    : ''
  return (
    <a
      className={`plate-search-recorte${current ? ' is-current' : ''}`}
      href={profileHref(item.placa, destination)}
      onClick={follow}
      title={`Abrir ${destination.analysis === 'trends' ? 'as tendências de circulação' : 'as correlações'} de ${item.placa} em ${recorte.label}.${facts}`}
    >
      {content}
    </a>
  )
}
