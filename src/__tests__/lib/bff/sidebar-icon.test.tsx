import { render } from '@testing-library/react'

import { SidebarIcon } from '@/app/(app)/components/sidebar/components/sidebar-icon'

describe('SidebarIcon', () => {
  it('renders Lucide Lab icons (Owl) as SVG', () => {
    const { container } = render(<SidebarIcon name="Owl" className="x" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('class')).toContain('x')
    expect(container.querySelector('ellipse')).not.toBeNull()
  })

  it('still renders lucide-react icons by name', () => {
    const { container } = render(<SidebarIcon name="Car" />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
