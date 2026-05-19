import { notFound } from 'next/navigation'

import { config } from '@/config'

import { ShiftClosingView } from '../components/shift-closing-view'

type PageProps = {
  params: Promise<{ shiftClosingId: string }>
}

export default async function ShiftClosingDetailPage({ params }: PageProps) {
  if (!config.enableChamados) {
    notFound()
  }

  const { shiftClosingId } = await params

  return (
    <div
      className="page-content space-y-4 overflow-y-scroll pb-24"
      style={{ backgroundColor: '#0c161f' }}
    >
      <div className="content">
        <ShiftClosingView shiftClosingId={shiftClosingId} />
      </div>
    </div>
  )
}
