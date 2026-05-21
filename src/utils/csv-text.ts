export const toCsvSpreadsheetText = (value: string | number) => {
  const text = String(value).replaceAll('"', '""')
  return `="${text}"`
}
