import {
  type Category,
  type Module,
  type ModuleWithChildren,
  sidebarItems,
} from '@/app/(app)/components/sidebar/components/constants'
import { filterChamadosSidebarModules } from '@/app/(app)/components/sidebar/components/filter-chamados-sidebar-modules'

const vehicles = sidebarItems.find(
  (item): item is Category => 'modules' in item && item.title === 'Veículos',
) as Category

function titles(modules: Category['modules']) {
  return modules.map((m) => (m as Module).title)
}

function permissions(canView: boolean, fullAccess = false) {
  return {
    role: null,
    screens: [
      {
        screen_code: 'vehicle_intelligence',
        screen_label: 'Inteligência Veicular',
        can_view: canView,
        allowed_actions: [],
      },
      {
        screen_code: 'vehicle_intelligence_full',
        screen_label: 'Inteligência Veicular (todas as telas)',
        can_view: fullAccess,
        allowed_actions: [],
      },
    ],
  }
}

function moduleEntry(canView: boolean, fullAccess: boolean) {
  return filterChamadosSidebarModules(
    vehicles.modules,
    permissions(canView, fullAccess),
    true,
  ).find(
    (m) => (m as Module).title === 'Inteligência Veicular',
  ) as ModuleWithChildren
}

describe('Veículos → Inteligência Veicular no sidebar', () => {
  it('shows the entry for roles with the vehicle_intelligence screen', () => {
    const visible = filterChamadosSidebarModules(
      vehicles.modules,
      permissions(true),
      true,
    )
    expect(titles(visible)).toContain('Inteligência Veicular')
  })

  it('hides the entry for other roles and keeps the existing vehicle screens', () => {
    const visible = filterChamadosSidebarModules(
      vehicles.modules,
      permissions(false),
      true,
    )
    expect(titles(visible)).not.toContain('Inteligência Veicular')
    expect(titles(visible)).toEqual([
      'Busca por Radar',
      'Busca por Placa',
      'Placas Correlatas em CCs',
    ])
  })

  it('lists only Placas correlatas and Perfil de placa without the full screen', () => {
    const entry = moduleEntry(true, false)
    expect(entry.path).toBe('/inteligencia-veicular/correlation')
    expect(entry.children.map((child) => child.path)).toEqual([
      '/inteligencia-veicular/correlation',
      '/inteligencia-veicular/profile',
    ])
  })

  it('lists the seven module screens with the full screen', () => {
    const entry = moduleEntry(true, true)
    expect(entry.children.map((child) => child.path)).toEqual([
      '/inteligencia-veicular',
      '/inteligencia-veicular/correlation',
      '/inteligencia-veicular/post-event',
      '/inteligencia-veicular/groups',
      '/inteligencia-veicular/territories',
      '/inteligencia-veicular/profile',
      '/inteligencia-veicular/occurrence',
    ])
  })

  it('hides the entry while permissions are loading', () => {
    const visible = filterChamadosSidebarModules(
      vehicles.modules,
      undefined,
      false,
    )
    expect(titles(visible)).not.toContain('Inteligência Veicular')
  })
})
