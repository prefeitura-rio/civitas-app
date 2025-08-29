'use client'

import { LogOut } from 'lucide-react'

import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/hooks/useQueries/use-profile'
import { queryClient } from '@/lib/react-query'
import { logout } from '@/utils/logout'

import { sidebarItems } from './components/constants'
import { SidebarAccordion } from './components/sidebar-accordion'
import { SidebarButton } from './components/sidebar-button'

export function Sidebar() {
  const { data: profile } = useProfile()
  return (
    <div className="relative z-50 h-screen w-14 shrink-0">
      <nav className="group absolute left-0 top-0 flex h-screen w-14 shrink-0 flex-col justify-between overflow-x-hidden border-r-2 bg-background p-2 transition-all duration-300 ease-in hover:w-64">
        <div className="flex flex-col">
          <div className="relative h-20">
            {profile ? (
              <div className="">
                <span className="absolute-centered text-2xl opacity-100 transition-opacity duration-300 group-hover:opacity-0">
                  {profile.username[0].toUpperCase()}
                </span>
                <span className="absolute-centered text-wrap text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {profile.username}
                </span>
              </div>
            ) : (
              <Skeleton className="my-1 h-4 w-full" />
            )}
          </div>

          <div>
            <SidebarButton icon="Home" title="Início" path="/" primary />
            {/* <Separator className="my-4" /> */}
          </div>

          <Accordion
            type="multiple"
            // defaultValue={modules.map((item) => item.title)}
          >
            {sidebarItems.map((item, index) => {
              if ('modules' in item) {
                return (
                  <SidebarAccordion
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    modules={item.modules}
                  />
                )
              } else {
                return (
                  <SidebarButton
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    path={item.path}
                    primary
                  />
                )
              }
            })}
          </Accordion>
        </div>

        <div className="flex flex-col gap-2">
          <SidebarButton
            icon={'Lightbulb'}
            title={'Novidades'}
            path="/novidades"
          />
          <Separator className="-mb-1 -mt-1" />
          <Button
            variant="ghost"
            className="justify-between px-2 group-hover:w-full"
            onClick={() => {
              queryClient.clear()
              logout()
            }}
          >
            <div className="flex items-center justify-start gap-2">
              <LogOut className="shrink-0 text-muted-foreground" />
              <span className="opacity-0 transition-all duration-300 group-hover:opacity-100">
                Sair
              </span>
            </div>
          </Button>
        </div>
      </nav>
    </div>
  )
}
