import type { InstitutionJurisdictionLevel } from '@/models/entities'

export const institutionJurisdictionOptions: Array<{
  value: InstitutionJurisdictionLevel
  label: string
}> = [
  { value: 'municipal', label: 'Municipal' },
  { value: 'estadual', label: 'Estadual' },
  { value: 'distrital', label: 'Distrital' },
  { value: 'federal', label: 'Federal' },
  { value: 'outros', label: 'Outros' },
]

export const institutionJurisdictionLabels = Object.fromEntries(
  institutionJurisdictionOptions.map((option) => [option.value, option.label]),
) as Record<InstitutionJurisdictionLevel, string>
