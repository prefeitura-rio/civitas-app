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
    <div ref={containerRef} className="page-content overflow-y-scroll">
      <Tabs
        defaultValue="demandantes"
        onValueChange={() => containerRef.current?.scrollTo(0, 0)}
      >
        <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="demandantes"
            className="rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Demandantes
          </TabsTrigger>
          <TabsTrigger
            value="requisitantes"
            className="rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Requisitantes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demandantes" className="mt-6">
          <section className="space-y-4">
            <RequestingInstitutionsHeader />
            <RequestingInstitutionsTable />
            <RequestingInstitutionDialogs />
          </section>
        </TabsContent>

        <TabsContent value="requisitantes" className="mt-6">
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
