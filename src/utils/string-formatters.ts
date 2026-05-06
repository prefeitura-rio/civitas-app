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

/**
 * Mantém apenas dígitos, com limite opcional.
 * Use `Infinity` para não cortar (ex.: exibir erro de máximo no formulário).
 */
export function maskDigitsOnly(value: string, maxLength: number = 60) {
  const digits = value.replace(/\D/g, '')
  return maxLength === Infinity ? digits : digits.slice(0, maxLength)
}

/** Completa com zeros à esquerda até `totalLength` (apenas dígitos do valor). */
export function padDigitsLeft(
  value: string | null | undefined,
  totalLength: number,
): string {
  if (value == null || value === '') return ''
  const digits = String(value).replace(/\D/g, '').slice(0, totalLength)
  if (!digits) return ''
  return digits.padStart(totalLength, '0')
}

/**
 * Placa veicular BR (Mercosul LLLNLNN ou antigo LLLNNNN): até 7 caracteres
 * alfanuméricos em maiúsculas, sem hífen (padrão atual).
 */
export function maskPlateBR(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7)
}

/** Valor da placa apenas com letras e números (para envio à API). */
export function unmaskPlateBR(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

const NUMERO_OFICIO_NUM_LEN = 5
const NUMERO_OFICIO_YEAR_LEN = 4
const NUMERO_OFICIO_MAX_DIGITS = NUMERO_OFICIO_NUM_LEN + NUMERO_OFICIO_YEAR_LEN

/** Máscara visual: até 5 dígitos do número + / + até 4 dígitos do ano (ex.: 00123/2026). */
export function maskNumeroOficio(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, NUMERO_OFICIO_MAX_DIGITS)
  const num = d.slice(0, NUMERO_OFICIO_NUM_LEN)
  const year = d.slice(NUMERO_OFICIO_NUM_LEN)
  if (!year) return num
  return `${num}/${year}`
}

/**
 * Normaliza no blur: número com 5 dígitos (zeros à esquerda) e, se houver ano, / + 4 dígitos.
 */
export function normalizeNumeroOficio(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, NUMERO_OFICIO_MAX_DIGITS)
  if (!d) return ''
  const num = padDigitsLeft(
    d.slice(0, NUMERO_OFICIO_NUM_LEN),
    NUMERO_OFICIO_NUM_LEN,
  )
  const yearDigits = d.slice(NUMERO_OFICIO_NUM_LEN)
  if (!yearDigits) return num
  const year = padDigitsLeft(yearDigits, NUMERO_OFICIO_YEAR_LEN)
  return `${num}/${year}`
}

export function maskPhoneBR(value: string) {
  const n = value.replace(/\D/g, '').slice(0, 11)
  if (n.length === 0) return ''

  if (n.length <= 2) {
    return `(${n}`
  }

  const ddd = n.slice(0, 2)
  const rest = n.slice(2)

  if (rest.length === 0) {
    return `(${ddd})`
  }

  if (rest[0] === '9') {
    if (rest.length === 1) {
      return `(${ddd}) ${rest}`
    }
    const body = rest.slice(1)
    if (body.length <= 4) {
      return `(${ddd}) ${rest[0]} ${body}`
    }
    return `(${ddd}) ${rest[0]} ${body.slice(0, 4)}-${body.slice(4)}`
  }

  if (rest.length <= 4) {
    return `(${ddd}) ${rest}`
  }
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
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
