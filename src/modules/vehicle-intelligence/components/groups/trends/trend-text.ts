/** Textos dos gráficos de tendências: dias, meses, plurais, a faixa de uma hora e a parte do total. */

export const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const WEEKDAY_NAMES = [
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
  'domingo',
]
export const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export const factsText = (n: number) => `${n} ${n === 1 ? 'fato' : 'fatos'}`
export const rosText = (n: number) => `${n} ${n === 1 ? 'RO' : 'ROs'}`
export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)
export const hourRange = (h: number) => `${h}h–${(h + 1) % 24}h`

export function shareOfTotal(n: number, total: number): string {
  const percent = (100 * n) / Math.max(1, total)
  return n > 0 && percent < 0.5
    ? 'menos de 1% do total'
    : `${Math.round(percent)}% do total`
}
