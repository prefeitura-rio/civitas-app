export function formatCPF(value: string) {
  // Remove any non-numeric characters
  const numericValue = value.replace(/\D/g, '')

  // Format the string with dots and dash
  let formattedValue = numericValue

  if (numericValue.length > 3) {
    formattedValue = numericValue.slice(0, 3) + '.' + numericValue.slice(3)
  }
  if (numericValue.length > 6) {
    formattedValue = formattedValue.slice(0, 7) + '.' + numericValue.slice(6)
  }
  if (numericValue.length > 9) {
    formattedValue = formattedValue.slice(0, 11) + '-' + numericValue.slice(9)
  }
  if (numericValue.length > 11) {
    formattedValue = formattedValue.slice(0, 14)
  }

  return formattedValue
}

export function formatPhone(value: string) {
  // Remove any non-numeric characters
  const numericValue = value.replace(/\D/g, '')

  const isCel = numericValue.length === 9 || numericValue.length === 11
  const isTel = numericValue.length === 8 || numericValue.length === 10
  const hasDDD = numericValue.length === 10 || numericValue.length === 11

  if (!isCel && !isTel) return value

  const ddd = hasDDD ? `(${numericValue.slice(0, 2)}) ` : ''
  const celDigit = isCel
    ? hasDDD
      ? numericValue.charAt(2) + ' '
      : numericValue.charAt(0) + ' '
    : ''
  const middleDigits =
    isCel && hasDDD
      ? numericValue.slice(3, 7)
      : isCel && !hasDDD
        ? numericValue.slice(1, 5)
        : !isCel && hasDDD
          ? numericValue.slice(2, 6)
          : numericValue.slice(0, 4)
  const last4Digits = numericValue.slice(-4)

  return ddd + celDigit + middleDigits + '-' + last4Digits
}

export function formatCNPJ(value: string) {
  // Remove any non-numeric characters
  const numericValue = value.replace(/\D/g, '')

  // Format the string with dots, slash, and dash
  let formattedValue = numericValue

  if (numericValue.length > 2) {
    formattedValue = numericValue.slice(0, 2) + '.' + numericValue.slice(2)
  }
  if (numericValue.length > 5) {
    formattedValue = formattedValue.slice(0, 6) + '.' + numericValue.slice(5)
  }
  if (numericValue.length > 8) {
    formattedValue = formattedValue.slice(0, 10) + '/' + numericValue.slice(8)
  }
  if (numericValue.length > 12) {
    formattedValue = formattedValue.slice(0, 15) + '-' + numericValue.slice(12)
  }
  if (numericValue.length > 14) {
    formattedValue = formattedValue.slice(0, 18)
  }

  return formattedValue
}
