import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const cards = [
  {
    title: 'Consulta de Placas',
    href: '/consulta-de-placas',
    description:
      'Pesquise por uma placa e veja no mapa locais onde ela foi detectada.',
  },
  {
    title: 'Placas Monitoradas',
    href: '/placas-monitoradas',
    description:
      'Cadastre uma placa e receba uma notificação quando ela for detectada.',
  },
  {
    title: 'Operações',
    href: '/operacoes',
    description:
      'Cadastre uma operação para ser vinculada a uma placa monitorada.',
  },
]

export default function Home() {
  return (
    <div className="page-content flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((item) => (
          <Link href={item.href} className="col-span-2">
            <Card className="h-full hover:bg-border">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
