interface TooltipInfoProps {
  label: string
  value: string
}

export function IconTooltipInfo({ label, value }: TooltipInfoProps) {
  return (
    <div>
      <span className="text-xs font-bold">{label}: </span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  )
}
