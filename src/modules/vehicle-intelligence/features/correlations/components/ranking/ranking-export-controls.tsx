import { Download } from 'lucide-react'

import { Button } from '@/modules/vehicle-intelligence/components/ui/button'
import { Label } from '@/modules/vehicle-intelligence/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/vehicle-intelligence/components/ui/select'
import type { RankingExport } from '@/modules/vehicle-intelligence/features/correlations/components/ranking/use-ranking-export'

const EXPORT_SIZES = [10, 20, 30, 50, 100] as const

/** "Exportar placas": o tamanho do Top e o botão; `unavailable` sem um resultado atual com placas. */
export function RankingExportControls({
  exporter,
  unavailable,
}: {
  exporter: RankingExport
  unavailable: boolean
}) {
  const {
    exportSize,
    setExportSize,
    exporting,
    setExportStatus,
    handleExport,
  } = exporter
  return (
    <div className="ranking-export">
      <Label htmlFor="ranking-export-size">Exportar placas</Label>
      <div>
        <Select
          value={String(exportSize)}
          onValueChange={(next) => {
            setExportSize(Number(next))
            setExportStatus(null)
          }}
        >
          <SelectTrigger
            id="ranking-export-size"
            aria-label="Quantidade de placas para exportar"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPORT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                Top {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={handleExport}
          disabled={unavailable || exporting}
          aria-describedby="ranking-export-status"
        >
          <Download size={16} />
          {exporting ? 'Exportando…' : `Exportar Top ${exportSize}`}
        </Button>
      </div>
    </div>
  )
}
