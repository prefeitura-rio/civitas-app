import { notFound } from 'next/navigation'

import { config } from '@/config'

import { ShiftClosingsList } from './components/shift-closings-list'

export default function ShiftClosingsPage() {
  if (!config.enableChamados) {
    notFound()
  }

  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content">
        <ShiftClosingsList />
      </div>
    </div>
  )
}
