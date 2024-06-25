import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function App() {
  return (
    <div className="page-content flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4">
        <Link href="/consulta-de-placas" className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Consulta de Placas</CardTitle>
              <CardDescription>
                Pesquise por uma placa para encontrar rotas por onde ela foi
                vista.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/monitoramento-de-placas" className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Monitoramento de Placas</CardTitle>
              <CardDescription>
                Cadastre uma placa e receba uma notificação quando ela for
                vista.
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
