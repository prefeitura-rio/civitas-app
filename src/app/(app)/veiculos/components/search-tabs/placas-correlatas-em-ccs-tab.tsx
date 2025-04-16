'use client'
import { History, Printer } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { retrievePDFReport } from '@/http/cars/correlated-plates-in-case-sets/retrieve-pdf-report'
import { cn } from '@/lib/utils'

enum SearchType {
  'CREATE' = 'CREATE',
  'READ' = 'READ',
}

export function PlacasCorrelatasEmCCsTabs() {
  const pathname = usePathname()
  const initialSearchType = pathname.includes('genarate-report')
    ? SearchType.CREATE
    : SearchType.READ
  const router = useRouter()

  const [reportId, setReportId] = useState('')
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [open, setOpen] = useState(false)

  const handleRetrieveReport = async () => {
    setLoading(true)
    setIsError(false)
    setOpen(true)
    try {
      const response = await retrievePDFReport(reportId)
      setOpen(false) // Close the modal before redirecting
      router.push(
        `/veiculos/placas-correlatas-em-ccs/genarate-report?state=${encodeURIComponent(
          JSON.stringify(response.report_history.body),
        )}`,
      )
    } catch (error) {
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-2 grid w-full grid-cols-2 rounded-md bg-secondary p-1 text-sm">
        <div
          className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-md p-2',
            initialSearchType === SearchType.CREATE
              ? 'bg-card'
              : 'text-muted-foreground',
          )}
          onClick={() =>
            router.push('/veiculos/placas-correlatas-em-ccs/genarate-report')
          }
        >
          <Printer className="size-5 shrink-0" />
          <span>Gerar Relatório</span>
        </div>
        <div
          className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-md p-1',
            initialSearchType === SearchType.READ
              ? 'bg-card'
              : 'text-muted-foreground',
          )}
          onClick={() =>
            router.push('/veiculos/placas-correlatas-em-ccs/retrieve-report')
          }
        >
          <History className="size-5 shrink-0" />
          <span>Recuperar Relatório</span>
        </div>
      </div>
      {initialSearchType === SearchType.READ && (
        <Card className="mb-2 flex w-full max-w-screen-md flex-col items-end gap-2 p-4">
          <Input
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            placeholder="Digite o ID do Relatório"
          />
          <Button
            onClick={handleRetrieveReport}
            className="mt-2"
            disabled={!reportId || loading}
          >
            Buscar Relatório
          </Button>
        </Card>
      )}
      <AlertDialog open={open}>
        <AlertDialogContent>
          <div className="flex flex-col items-center justify-center">
            {isError ? (
              <>
                <p className="text-center text-red-500">
                  Erro ao recuperar relatório. Por favor, tente novamente.
                </p>
                <div className="mt-4 flex w-full justify-end">
                  <Button
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2"
                  >
                    Fechar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Spinner className="size-8" />
                <p className="text-center">Recuperando dados...</p>
              </>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
