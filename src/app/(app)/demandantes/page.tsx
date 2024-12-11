import { OperationsContextProvider } from '@/contexts/operations-context'

import { OperationDialogs } from './components/operation-dialogs'
import { OperationsHeader } from './components/operations-header'
import { OperationsTable } from './components/operations-table'

export default function Operacoes() {
  return (
    <OperationsContextProvider>
      <div className="page-content space-y-4 overflow-y-scroll">
        <OperationsHeader />
        <OperationsTable />

        <OperationDialogs />
      </div>
    </OperationsContextProvider>
  )
}
