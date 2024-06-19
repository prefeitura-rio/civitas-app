'use client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { isAuthenticated } from '@/utils/isAuthenticated'

export default function App() {
  if (!isAuthenticated()) {
    redirect('/auth/sign-in')
  }
  return (
    <div className="page-content flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4">
        <Link href="/cerco-digital" className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Cerco Digital</CardTitle>
              <CardDescription>
                Consulta e monitoramento de placas
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/" className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>🏗️ Em construção...</CardTitle>
              <CardDescription>...</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/" className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>🏗️ Em construção...</CardTitle>
              <CardDescription>...</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/" className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>🏗️ Em construção...</CardTitle>
              <CardDescription>...</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
