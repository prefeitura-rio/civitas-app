import { useState } from 'react'

import {
  formatDate,
  formatDateTime,
} from '@/modules/vehicle-intelligence/lib/dates'
import { pluralize } from '@/modules/vehicle-intelligence/lib/format'
import { titleCase } from '@/modules/vehicle-intelligence/lib/labels'
import type {
  PlateDenuncia,
  PlateDenunciasData,
} from '@/modules/vehicle-intelligence/types/domain'

/** O relato com o trecho onde a placa aparece marcado (como foi escrita). */
function Report({ item }: { item: PlateDenuncia }) {
  const text = item.report ?? ''
  const start = Math.max(0, Math.min(item.mention_start, text.length))
  const end = Math.max(start, Math.min(item.mention_end, text.length))
  return (
    <p className="profile-denuncia-report">
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </p>
  )
}

const people = (item: PlateDenuncia) =>
  item.involved
    .map((person) =>
      [person.nome, person.vulgo && `“${person.vulgo}”`]
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)

/**
 * As denúncias do Disque Denúncia que citam a placa, no molde dos ROs que a citam: uma linha por denúncia (data,
 * assunto, situação, local) e a denúncia inteira ao abrir. Denúncia anônima, não verificada.
 */
/** Quantas aparecem antes de "Mostrar as outras" (a mais recente primeiro). */
const FIRST = 5

export function DenunciaSummary({ data }: { data: PlateDenunciasData | null }) {
  const [all, setAll] = useState(false)
  if (!data?.available || !data.reports.length) return null
  const count = pluralize(data.reports.length, 'denúncia', 'denúncias')
  const shown = all ? data.reports : data.reports.slice(0, FIRST)
  return (
    <section
      className="profile-citation-summary profile-denuncias"
      aria-label="Denúncias que citam a placa"
    >
      <header>
        <strong>Citada em {count} do Disque Denúncia</strong>
        <span>{data.warning}</span>
      </header>
      <ul>
        {shown.map((item) => {
          const involved = people(item)
          return (
            <li key={item.id}>
              <div className="profile-citation-line">
                <strong>
                  {item.number ? `Denúncia ${item.number}` : 'Denúncia'}
                </strong>
                <span>{formatDateTime(item.reported_at, 'sem data')}</span>
                <span title={item.subjects.join(' · ')}>
                  {[
                    item.subject && titleCase(item.subject.toLowerCase()),
                    item.status && titleCase(item.status.toLowerCase()),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              <p>
                {[
                  item.address,
                  item.neighborhood &&
                    titleCase(item.neighborhood.toLowerCase()),
                  item.subneighborhood &&
                    titleCase(item.subneighborhood.toLowerCase()),
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Local não informado'}
                {item.diffused_at
                  ? ` · difundida em ${formatDate(item.diffused_at)}`
                  : ''}
                {item.corrected
                  ? ` · placa escrita “${item.mention}” no relato`
                  : ''}
              </p>
              <details className="profile-citation-dynamics">
                <summary>Ler a denúncia</summary>
                <Report item={item} />
                {item.reference && (
                  <p className="profile-denuncia-meta">
                    Referência: {item.reference}
                  </p>
                )}
                {involved.length > 0 && (
                  <p className="profile-denuncia-meta">
                    Envolvidos citados: {involved.join(', ')}
                  </p>
                )}
                {item.subjects.length > 1 && (
                  <p className="profile-denuncia-meta">
                    Assuntos: {item.subjects.join(' · ')}
                  </p>
                )}
              </details>
            </li>
          )
        })}
      </ul>
      {data.reports.length > FIRST && (
        <button
          type="button"
          className="profile-denuncias-more"
          onClick={() => setAll((current) => !current)}
        >
          {all
            ? 'Mostrar só as mais recentes'
            : `Mostrar as outras ${data.reports.length - FIRST}`}
        </button>
      )}
    </section>
  )
}
