'use client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  Card,
  CardContent,
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
    <div className="grid w-full grid-cols-4 gap-4">
      <Link href="/cerco-digital" className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Cerco Digital</CardTitle>
            <CardDescription>
              Consulta e monitoramento de placas
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/" className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>🏗️ Em construção...</CardTitle>
            <CardDescription>...</CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/" className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>🏗️ Em construção...</CardTitle>
            <CardDescription>...</CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/" className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>🏗️ Em construção...</CardTitle>
            <CardDescription>...</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </div>
  )
}
