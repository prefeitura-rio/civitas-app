import type { FieldErrors } from 'react-hook-form'

import { getFirstFormError } from '@/utils/form-errors'

const fieldLabels: Record<string, string> = {
  operation_id: 'Operação',
  ticket_type_id: 'Tipo de demanda',
  nature_id: 'Natureza',
  team_id: 'Equipe',
  requester: 'Solicitante',
  focal_points: 'Ponto focal',
  name: 'Nome',
  phone: 'Telefone',
  email: 'E-mail',
  cpf: 'CPF',
  registration: 'Matrícula',
  addresses: 'Endereço',
  cameras: 'Câmera',
  plates: 'Placa',
  period_start: 'Início do período',
  period_end: 'Fim do período',
  orientation: 'Orientação',
  description: 'Descrição',
  procedure_number: 'Número do procedimento',
  official_letter_number: 'Número do ofício',
  base_date: 'Data-base',
  press_alias: 'Apelido na imprensa',
  article_link: 'Link da matéria',
  correspondence_neighborhood: 'Bairro de correspondência',
  correspondence_street: 'Rua de correspondência',
  correspondence_number: 'Número de correspondência',
  initial_comment: 'Comentário',
}

const serviceLabels: Record<string, string> = {
  plate_search: 'Busca por placa',
  radar_search: 'Busca por radar',
  electronic_fence: 'Cerco eletrônico',
  image_search: 'Busca por imagem',
  correlated_plates: 'Placas correlatas',
  joint_plates: 'Placas conjuntas',
  image_reservation: 'Reserva de imagem',
  image_analysis: 'Análise de imagem',
  other: 'Outros',
  atlas_civitas: 'Atlas Civitas',
}

export function getTicketCreateFormErrorMessage(
  errors: FieldErrors,
): string | undefined {
  const first = getFirstFormError(errors)
  if (!first) return undefined

  const parts: string[] = []
  for (const segment of first.path) {
    if (/^\d+$/.test(segment)) {
      if (parts.length > 0) parts[parts.length - 1] += ` ${Number(segment) + 1}`
      continue
    }
    parts.push(
      serviceLabels[segment] ??
        fieldLabels[segment] ??
        segment.replaceAll('_', ' '),
    )
  }

  const message = /^required$/i.test(first.message)
    ? 'Campo obrigatório'
    : first.message
  return parts.length > 0 ? `${parts.join(' — ')}: ${message}` : message
}

export function getTicketCreateServiceItemError(
  errors: FieldErrors,
  service: string,
  index: number,
): { path: string[]; message: string; label: string } | undefined {
  const items = errors[service]
  if (!Array.isArray(items) || !items[index]) return undefined

  const first = getFirstFormError(items[index] as FieldErrors)
  if (!first) return undefined

  const label = getTicketCreateFormErrorMessage({
    [service]: { [index]: items[index] },
  } as FieldErrors)
  if (!label) return undefined

  return { ...first, label }
}
