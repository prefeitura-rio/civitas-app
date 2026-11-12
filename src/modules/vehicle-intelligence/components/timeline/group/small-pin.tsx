import { PIN_PATH } from '@/modules/vehicle-intelligence/components/timeline/palette'

/** O pino pequeno do fato, nas faixas de tempo. */
export const SmallPin = ({ color }: { color: string }) => (
  <svg width="9" height="12" viewBox="0 0 32 40" aria-hidden="true">
    <path d={PIN_PATH} fill={color} />
  </svg>
)
