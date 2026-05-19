'use client'
import { useQuery } from '@tanstack/react-query'

import { SelectWithSearch } from '@/components/custom/select-with-search'
import { Tooltip } from '@/components/custom/tooltip'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useDemandantsContext } from '@/hooks/useContexts/use-demandants-context'
import { useDemandantsSearchParams } from '@/hooks/useParams/useDemandantsSearchParams'
import { useProfile } from '@/hooks/useQueries/useProfile'
import {
  getOrganizationsForDemandantsFilter,
  ORGANIZATIONS_DEMANDANTS_FILTER_QUERY_KEY,
} from '@/http/organizations/get-organizations'
import { notAllowed } from '@/utils/template-messages'

export function DemandantsHeader() {
  const { formDialogDisclosure, setDialogInitialData } = useDemandantsContext()
  const { data: profile } = useProfile()
  const { formattedSearchParams, setOrganizationFilter } =
    useDemandantsSearchParams()

  const {
    data: requesters = [],
    isLoading: isLoadingOrganizations,
    isError: isOrganizationsError,
  } = useQuery({
    queryKey: ORGANIZATIONS_DEMANDANTS_FILTER_QUERY_KEY,
    queryFn: getOrganizationsForDemandantsFilter,
    staleTime: 60_000,
  })

  const selectedOrg = requesters.find(
    (o) => o.id === formattedSearchParams.organizationId,
  )
  const filterDisplay = selectedOrg
    ? `${selectedOrg.name} (${selectedOrg.acronym})`
    : 'Todos os requisitantes'

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h3 className="text-lg font-semibold">Demandantes</h3>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex min-w-[14rem] flex-col gap-1">
          <Label className="text-xs text-muted-foreground">
            Filtrar por requisitante
          </Label>
          <SelectWithSearch
            placeholder={
              isLoadingOrganizations
                ? 'Carregando requisitantes…'
                : isOrganizationsError
                  ? 'Erro ao carregar requisitantes'
                  : 'Todos os requisitantes'
            }
            value={isLoadingOrganizations ? '' : filterDisplay}
            disabled={isLoadingOrganizations}
            options={[
              { label: 'Todos os requisitantes', value: '' },
              ...requesters.map((o) => ({
                label: `${o.name} (${o.acronym})`,
                value: o.id,
              })),
            ]}
            onSelect={(item) => setOrganizationFilter(item.value || undefined)}
          />
          {isOrganizationsError ? (
            <p className="text-xs text-destructive">
              Não foi possível carregar a lista de requisitantes. Atualize a
              página ou tente novamente.
            </p>
          ) : null}
        </div>
        <Tooltip
          disabledText={notAllowed}
          disabled={!profile?.is_admin}
          hideContent={!profile || profile.is_admin}
          asChild
        >
          <Button
            disabled={!profile?.is_admin}
            onClick={() => {
              setDialogInitialData(null)
              formDialogDisclosure.onOpen()
            }}
            size="sm"
          >
            Adicionar demandante
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
