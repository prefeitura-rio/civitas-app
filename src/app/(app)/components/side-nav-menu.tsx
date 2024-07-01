import { LogOut, Search, Siren } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import logo from '@/assets/civitas-logotype-dark.png'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

export function SideNavMenu() {
  return (
    <div className="flex h-screen flex-col items-center bg-card py-2">
      <div className="mb-8 h-12 w-12 p-2">
        <Tooltip text="Início" side="right">
          <Link href="/">
            <Image
              src={logo}
              alt="Logo Prefeitura Rio"
              className="h-[100%] w-auto"
            />
          </Link>
        </Tooltip>
      </div>
      <ul className="flex h-full flex-col justify-between">
        <div className="space-y-2">
          <li>
            <Tooltip text="Consulta de placas" side="right">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/consulta-de-placas">
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
            </Tooltip>
          </li>
          <li>
            <Tooltip text="Monitoramento de placas" side="right">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/monitoramento-de-placas">
                  <Siren className="h-4 w-4" />
                </Link>
              </Button>
            </Tooltip>
          </li>
        </div>
        <li className="mb-2">
          <Tooltip text="Sair" side="right">
            <Button variant="secondary" size="sm" asChild>
              <a href="/api/auth/sign-out">
                <LogOut className="h-4 w-4" />
              </a>
            </Button>
          </Tooltip>
        </li>
      </ul>
    </div>
  )
}
