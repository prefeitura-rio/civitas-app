import { OperationsContextProvider } from '@/contexts/operations-context'

import { CreateOperationDialog } from './components/create-dialog/create-operation-dialog'
import { OperationsHeader } from './components/header/operations-header'
import { OperationsTable } from './components/table/operations-table'

export default function Operacoes() {
  return (
    <OperationsContextProvider>
      <div className="page-content">
        <OperationsHeader />
        <OperationsTable />

        <CreateOperationDialog />
      </div>
    </OperationsContextProvider>
  )
}
