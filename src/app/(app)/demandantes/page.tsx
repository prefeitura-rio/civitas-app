'use client'

import { useRef } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { InstitutionAuthoritiesHeader } from './components/institution-authorities/institution-authorities-header'
import { InstitutionAuthoritiesTable } from './components/institution-authorities/institution-authorities-table'
import { InstitutionAuthorityDialogs } from './components/institution-authorities/institution-authority-dialogs'
import { RequestingInstitutionDialogs } from './components/requesting-institutions/requesting-institution-dialogs'
import { RequestingInstitutionsHeader } from './components/requesting-institutions/requesting-institutions-header'
import { RequestingInstitutionsTable } from './components/requesting-institutions/requesting-institutions-table'

export default function DemandantesPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={containerRef}
      className="page-content space-y-6 overflow-y-scroll"
    >
      <h2 className="text-2xl font-semibold">Requisitantes e autoridades</h2>

      <Tabs
        defaultValue="demandantes"
        onValueChange={() => containerRef.current?.scrollTo(0, 0)}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="requisitantes" className="flex-1 sm:flex-none">
            Requisitantes
          </TabsTrigger>
          <TabsTrigger value="demandantes" className="flex-1 sm:flex-none">
            Autoridades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requisitantes">
          <section className="space-y-4">
            <RequestingInstitutionsHeader />
            <RequestingInstitutionsTable />
            <RequestingInstitutionDialogs />
          </section>
        </TabsContent>

        <TabsContent value="demandantes">
          <section className="space-y-4">
            <InstitutionAuthoritiesHeader />
            <InstitutionAuthoritiesTable />
            <InstitutionAuthorityDialogs />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
