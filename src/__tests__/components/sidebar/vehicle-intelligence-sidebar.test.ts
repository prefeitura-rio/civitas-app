import {
  type Category,
  type Module,
  sidebarItems,
} from '@/app/(app)/components/sidebar/components/constants'
import { filterChamadosSidebarModules } from '@/app/(app)/components/sidebar/components/filter-chamados-sidebar-modules'

const vehicles = sidebarItems.find(
  (item): item is Category => 'modules' in item && item.title === 'Veículos',
) as Category

function titles(modules: Category['modules']) {
  return modules.map((m) => (m as Module).title)
}

function permissions(canView: boolean) {
  return {
    role: null,
    screens: [
      {
        screen_code: 'vehicle_intelligence',
        screen_label: 'Inteligência Veicular',
        can_view: canView,
        allowed_actions: [],
      },
    ],
  }
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

  it('hides the entry while permissions are loading', () => {
    const visible = filterChamadosSidebarModules(
      vehicles.modules,
      undefined,
      false,
    )
    expect(titles(visible)).not.toContain('Inteligência Veicular')
  })
})
