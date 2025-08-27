'use client'

import { ReactNode } from 'react'
import { I18nProvider } from 'react-aria'

interface LocaleProviderProps {
  children: ReactNode
  locale?: string
}

export function LocaleProvider({
  children,
  locale = 'pt-BR',
}: LocaleProviderProps) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>
}
