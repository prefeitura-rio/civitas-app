'use client'

import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getOrganizationsForDemandantsFilter,
  ORGANIZATIONS_DEMANDANTS_FILTER_QUERY_KEY,
} from '@/http/organizations/get-organizations'

import { DemandantDialogs } from './components/demandants-section/demandant-dialogs'
import { DemandantsHeader } from './components/demandants-section/demandants-header'
import { DemandantsTable } from './components/demandants-section/demandants-table'
import { OrganizationDialogs } from './components/organizations/organization-dialogs'
import { OrganizationsHeader } from './components/organizations/organizations-header'
import { OrganizationsTable } from './components/organizations/organizations-table'

export default function DemandantesPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  /** Mesma queryKey de `DemandantsHeader`: prefetch ao abrir a rota. */
  useQuery({
    queryKey: ORGANIZATIONS_DEMANDANTS_FILTER_QUERY_KEY,
    queryFn: getOrganizationsForDemandantsFilter,
    staleTime: 60_000,
  })

  return (
    <div
      ref={containerRef}
      className="page-content space-y-6 overflow-y-scroll"
    >
      <h2 className="text-2xl font-semibold">Requisitantes e demandantes</h2>

      <Tabs
        defaultValue="demandants"
        onValueChange={() => containerRef.current?.scrollTo(0, 0)}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="organizations" className="flex-1 sm:flex-none">
            Requisitantes
          </TabsTrigger>
          <TabsTrigger value="demandants" className="flex-1 sm:flex-none">
            Demandantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <section className="space-y-4">
            <OrganizationsHeader />
            <OrganizationsTable />
            <OrganizationDialogs />
          </section>
        </TabsContent>

        <TabsContent value="demandants">
          <section className="space-y-4">
            <DemandantsHeader />
            <DemandantsTable />
            <DemandantDialogs />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
