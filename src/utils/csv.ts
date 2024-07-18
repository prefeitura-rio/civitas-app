// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToCSV = (filename: string, rows: any[]) => {
  if (!rows || !rows.length) {
    return
  }

  const separator = ','
  const keys = Object.keys(rows[0])
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((key) => {
            let cell =
              row[key] === null || row[key] === undefined ? '' : row[key]
            cell =
              cell instanceof Date
                ? cell.toLocaleString()
                : cell.toString().replace(/"/g, '""')
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`
            }
            return cell
          })
          .join(separator)
      })
      .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
