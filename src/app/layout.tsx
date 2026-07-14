import './globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

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
      {/*
       * env-config.js is generated at container startup by scripts/docker-entrypoint.sh
       * and populates window.__ENV__ with runtime public env vars.
       * This script MUST be render-blocking (no async/defer) so that window.__ENV__
       * is available before React hydration initializes any module that reads config.
       * In local dev, the placeholder public/env-config.js defines an empty object
       * and values fall back to process.env.NEXT_PUBLIC_* from .env.local.
       */}
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/env-config.js" />
      </head>
      <body className={cn(inter.className, 'overflow-y-hidden')}>
        <Toaster duration={4000} />
        {children}
      </body>
    </html>
  )
}
