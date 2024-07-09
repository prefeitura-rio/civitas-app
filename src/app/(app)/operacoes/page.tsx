import { OperationsContextProvider } from '@/contexts/operations-context'

import { Dialogs } from './components/dialogs/dialogs'
import { OperationsHeader } from './components/header/operations-header'
import { OperationsTable } from './components/table/operations-table'

export default function Operacoes() {
  return (
    <OperationsContextProvider>
      <div className="page-content space-y-4">
        <OperationsHeader />
        <OperationsTable />

        <Dialogs />
      </div>
    </OperationsContextProvider>
  )
}
