'use client'

import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AuthorityLinkDialogShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer: ReactNode
  className?: string
}

/**
 * Layout padrão dos dialogs de vínculo:
 * header fixo | corpo com scroll | footer fixo (sem sticky no scroll).
 */
export function AuthorityLinkDialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: AuthorityLinkDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl',
          className,
        )}
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b px-4 py-4 pr-12 text-left sm:px-6">
          <DialogTitle className="leading-tight">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="break-words text-left">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {children}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t px-4 py-4 sm:space-x-0 sm:px-6">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
