import Link from 'next/link'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const cards = [
  {
    title: 'Veículos',
    href: '/veiculos',
    description:
      'Consulte radares e câmeras da cidade, pesquise por placas, gere relatórios de detecção e mais.',
  },
  {
    title: 'Pessoas',
    href: '/pessoas',
    description: 'Consulte pessoas físicas e jurídicas.',
  },
  {
    title: 'Ocorrências',
    href: '/ocorrencias/timeline',
    description:
      'Veja denúncias e reportes registrados por diversos canais, além de um dashboard com diferentes insights sobre os registros',
  },
  {
    title: 'Playground',
    href: '/playground',
    description: 'Desenhe no mapa, adicione pontos e trajetos de interesse.',
  },
  {
    title: 'Dashboards',
    href: '/dashboards/status-infra-radares',
    description: 'Veja insights sobre radares e câmeras da cidade.',
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
        {cards.map((item, index) => (
          <Link key={index} href={item.href} className="col-span-2">
            <Card className="h-full max-w-[40rem] hover:bg-border">
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
