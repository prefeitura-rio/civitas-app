import type {
  SelectWithSearchFetchPageArgs,
  SelectWithSearchPage,
} from '@/components/custom/select-with-search'
import { getRequestingInstitutions } from '@/http/requesting-institutions'

export async function fetchRequestingInstitutionFieldPage(
  field: 'type' | 'agency',
  { page, size, search }: SelectWithSearchFetchPageArgs,
): Promise<SelectWithSearchPage> {
  const response = await getRequestingInstitutions({
    page,
    size,
    type: field === 'type' ? search || undefined : undefined,
    agency: field === 'agency' ? search || undefined : undefined,
    sortBy: field,
    sortDirection: 'asc',
  })

  const seen = new Set<string>()
  const items: SelectWithSearchPage['items'] = []

  for (const item of response.data.items) {
    const raw = item[field]?.trim()
    if (!raw) continue

    const key = raw.toLocaleLowerCase('pt-BR')
    if (seen.has(key)) continue

    seen.add(key)
    items.push({ label: raw, value: raw })
  }

  return {
    items,
    page: response.data.page,
    pages: response.data.pages,
  }
}
