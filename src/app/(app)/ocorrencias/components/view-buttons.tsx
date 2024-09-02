'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { GenerateReportButton } from './pdf-report/generate-report-button'
import { Views } from './views'

export function ViewButtons() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const view = pathname.replace('/ocorrencias', '')

  return (
    <div className="flex w-full gap-2">
      {Object.entries(Views).map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          onClick={() =>
            router.push(
              `/ocorrencias/${item[1].toLocaleLowerCase()}?${searchParams.toString()}`,
            )
          }
          className={cn(
            'w-40 shrink-0 border-b-2',
            item[1].toLowerCase() === view.replace('/', '')
              ? 'border-b-2 border-primary'
              : 'border-opacity-0',
          )}
        >
          {item[1]}
        </Button>
      ))}
      <div className="flex w-full justify-end px-2">
        <GenerateReportButton />
      </div>
    </div>
  )
}
