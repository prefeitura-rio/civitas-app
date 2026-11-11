/** Textos e medidas das ligações e dos membros de um grupo, comuns ao cartão, ao perfil do grupo e aos territórios. */
import { copassagem } from '@/modules/vehicle-intelligence/config/recortes'
import type {
  GroupEdge,
  GroupMember,
} from '@/modules/vehicle-intelligence/types/groups'

/** Aviso das telas de grupos e territórios. */
export const INVESTIGATION_NOTICE =
  'Indício para investigação: não comprova autoria nem vínculo com facção.'

/** Espessura da ligação: passagens juntas no fato (transeuntes) ou ROs em comum (veículos e carga, onde passar junto quase
 * sempre acontece e a ligação forte é dividir ROs). */
export const linkWeight = (edge: {
  together_at_fact: number
  shared_events: number
}) => (copassagem ? edge.shared_events : edge.together_at_fact)

/** A ligação por extenso, para o título no grafo. */
export function describeEdge(edge: GroupEdge): string {
  const parts = [
    `${edge.a} + ${edge.b}`,
    `${edge.shared_events} ${edge.shared_events === 1 ? 'RO em comum' : 'ROs em comum'}`,
    `passaram juntas perto do fato em ${edge.together_at_fact}`,
    `desconectaram juntas em ${edge.disconnected_together}`,
    `${edge.days_together_outside_facts} ${edge.days_together_outside_facts === 1 ? 'dia junto' : 'dias juntos'} fora dos fatos`,
  ]
  if (edge.double_read)
    parts.push('placas a 1 caractere: provável leitura dupla')
  if (edge.routine) parts.push('andam juntas também fora dos fatos (rotina)')
  return parts.join(' · ')
}

/** A chance de acaso por extenso: "acaso: 1 em 1 bilhão", "1 em 100 mil", "1 em 640". */
export function describeChance(chance: number): string {
  // Abaixo de 1 em 1 trilhão a conta só diz que é desprezível (o valor exato sai do limite do ponto flutuante).
  return chance < 1e-12
    ? 'acaso: menos de 1 em 1 trilhão'
    : `acaso: 1 em ${oneIn(chance)}`
}

function oneIn(chance: number): string {
  const x = Math.round(1 / chance)
  const scaled = (value: number, singular: string, plural: string) => {
    const rounded = Math.round(value)
    return `${rounded.toLocaleString('pt-BR')} ${rounded === 1 ? singular : plural}`
  }
  if (x >= 1e9) return scaled(x / 1e9, 'bilhão', 'bilhões')
  if (x >= 1e6) return scaled(x / 1e6, 'milhão', 'milhões')
  if (x >= 1e4) return `${Math.round(x / 1e3).toLocaleString('pt-BR')} mil`
  return x.toLocaleString('pt-BR')
}

/** "Semente · 4ª no ranking" ou "Parceira" (Começos e fins e o balão das ligações). */
export const memberRole = (member: GroupMember) =>
  member.seed ? `Semente · ${member.coverage_rank}ª no ranking` : 'Parceira'

/** O texto da metodologia sem o prefixo "Termo:" (o termo vira o rótulo da lista de critérios). */
export const withoutTerm = (text: string | undefined) =>
  (text ?? '').replace(/^[^:]+:\s*/, '')

/** Semelhança de rotina (0 a 1) com duas casas: "0,87". */
export const formatSimilarity = (value: number) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
