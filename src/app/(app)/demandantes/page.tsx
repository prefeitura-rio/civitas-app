import { DemandantDialogs } from './components/demandants-section/demandant-dialogs'
import { DemandantsHeader } from './components/demandants-section/demandants-header'
import { DemandantsTable } from './components/demandants-section/demandants-table'
import { OrganizationDialogs } from './components/organizations/organization-dialogs'
import { OrganizationsHeader } from './components/organizations/organizations-header'
import { OrganizationsTable } from './components/organizations/organizations-table'

export default function DemandantesPage() {
  return (
    <div className="page-content space-y-10 overflow-y-scroll">
      <h2 className="text-2xl font-semibold">Organizações e demandantes</h2>

      <section className="space-y-4">
        <OrganizationsHeader />
        <OrganizationsTable />
        <OrganizationDialogs />
      </section>

      <section className="space-y-4">
        <DemandantsHeader />
        <DemandantsTable />
        <DemandantDialogs />
      </section>
    </div>
  )
}
