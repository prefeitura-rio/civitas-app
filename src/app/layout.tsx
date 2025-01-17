import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { ErrorToast } from '@/utils/error-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CIVITAS',
  description: 'Prefeitura do Rio de Janeiro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={cn(inter.className, 'overflow-y-hidden')}>
        <Toaster closeButton duration={4000} />
        <ErrorToast />
        {children}
      </body>
    </html>
  )
}
