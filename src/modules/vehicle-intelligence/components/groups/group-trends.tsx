/**
 * Tendências do perfil do grupo: quando o grupo age (mapa de calor dia da semana × hora, com o total por hora e
 * por dia), a série de fatos por mês (todos os ROs e os com 2+ placas do grupo) e as delegacias.
 *
 * Os gráficos são interativos sem mudar o desenho: o mouse (ou o foco do teclado) sobre uma célula, uma barra,
 * um mês ou uma delegacia mostra um balão com os números e os ROs, e destaca a linha e a coluna; a legenda da
 * série liga e desliga cada linha.
 */
import { MonthlySeries } from '@/modules/vehicle-intelligence/components/groups/trends/monthly-series'
import { PoliceStations } from '@/modules/vehicle-intelligence/components/groups/trends/police-stations'
import type { TrendsData } from '@/modules/vehicle-intelligence/components/groups/trends/trends-data'
import { WeekdayHourHeatmap } from '@/modules/vehicle-intelligence/components/groups/trends/weekday-hour-heatmap'

export function GroupTrends({
  data,
  togetherLabel = 'Com 2+ placas do grupo',
}: {
  data: TrendsData
  togetherLabel?: string
}) {
  return (
    <>
      <div className="group-trends-heat">
        <WeekdayHourHeatmap data={data} />
      </div>
      <div className="group-trends-bottom">
        <MonthlySeries data={data} togetherLabel={togetherLabel} />
        <PoliceStations data={data} togetherLabel={togetherLabel} />
      </div>
    </>
  )
}
