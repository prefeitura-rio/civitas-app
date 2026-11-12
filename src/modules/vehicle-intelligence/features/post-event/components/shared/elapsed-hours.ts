/**
 * Tempo do fato à desconexão: "5 h" até um dia, "1,5 dias" depois. As horas saem com até `hourDigits` casas: a
 * copassagem mostra até 3 (o padrão do toLocaleString), o entorno até 1.
 */
export function formatElapsedHours(
  value: number | null | undefined,
  hourDigits = 3,
): string {
  if (value == null) return 'tempo não calculado'
  if (value < 24)
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: hourDigits })} h`
  return `${(value / 24).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`
}
