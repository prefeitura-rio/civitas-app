import { OperationsContextProvider } from '@/contexts/operations-context'

import PageContent from './components/page-content'

export default function Operacoes() {
  return (
    <OperationsContextProvider>
      <PageContent />
    </OperationsContextProvider>
  )
}
