import { Card } from '@/components/ui/card'

export function MapCaption() {
  return (
    <Card className="absolute bottom-2 left-2 flex w-60 flex-col gap-1 whitespace-nowrap bg-opacity-50 p-2 tracking-tighter">
      <span className="w-full text-center text-sm font-bold">
        Intervalo do trecho
      </span>
      <div className="flex w-full items-center gap-2 text-xs">
        <span>0 min</span>
        <div className="flex h-2 w-full rounded-md bg-gradient-to-r from-blue-500 to-red-500"></div>
        <span>60 min</span>
      </div>
    </Card>
  )
}
