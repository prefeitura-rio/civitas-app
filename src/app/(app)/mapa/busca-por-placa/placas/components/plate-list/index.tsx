import { PlatesTable } from './components/plates-table'

interface PlateListProps {
  isLoading: boolean
  data: { plate: string }[]
}

export function PlateList({ data, isLoading }: PlateListProps) {
  return (
    <div className="mb-4 h-full w-full rounded">
      {data.length > 0 ? (
        <PlatesTable data={data} isLoading={isLoading} />
      ) : (
        <div className="flex h-full w-full justify-center pt-6">
          <span className="text-muted-foreground">
            Nenhum veículo encontrado.
          </span>
        </div>
      )}
    </div>
  )
}
