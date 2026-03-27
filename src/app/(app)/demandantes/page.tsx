'use client'

import { useRef } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DemandantDialogs } from './components/demandants-section/demandant-dialogs'
import { DemandantsHeader } from './components/demandants-section/demandants-header'
import { DemandantsTable } from './components/demandants-section/demandants-table'
import { OrganizationDialogs } from './components/organizations/organization-dialogs'
import { OrganizationsHeader } from './components/organizations/organizations-header'
import { OrganizationsTable } from './components/organizations/organizations-table'

export default function DemandantesPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={containerRef}
      className="page-content space-y-6 overflow-y-scroll"
    >
      <h2 className="text-2xl font-semibold">Organizações e demandantes</h2>

      <Tabs
        defaultValue="organizations"
        onValueChange={() => containerRef.current?.scrollTo(0, 0)}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="organizations" className="flex-1 sm:flex-none">
            Organizações
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
