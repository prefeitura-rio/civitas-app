import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Home() {
  return (
    <div className="page-content flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4">
        <Link href="/consulta-de-placas" className="col-span-2">
          <Card className="h-full hover:bg-border">
            <CardHeader>
              <CardTitle>Consulta de Placas</CardTitle>
              <CardDescription>
                Pesquise por uma placa para encontrar rotas por onde ela foi
                vista.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* <Link href="/monitoramento-de-placas" className="col-span-2">
          <Card className="h-full hover:bg-border">
            <CardHeader>
              <CardTitle>Monitoramento de Placas</CardTitle>
              <CardDescription>
                Cadastre uma placa e receba uma notificação quando ela for
                vista.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/placas-monitoradas" className="col-span-2">
          <Card className="h-full hover:bg-border">
            <CardHeader>
              <CardTitle>Operações</CardTitle>
              <CardDescription>
                Cadastre uma operação para ser vinculada a uma placa monitorada.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
