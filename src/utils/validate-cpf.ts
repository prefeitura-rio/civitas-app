export function validateCPF(cpf: string) {
  /* Considere um cpf 'abc.def.ghi-jk'
   * 1ª Validação: rest = j
   * sum = a*10 + b*9 + c*8 + ... + i*2
   * rest = (sum * 10) % 11
   * Se rest = 10, o consideramos 0
   *
   * 2ª Validação: rest = k
   * sum = a*11 + b*10 + c*7 + ... + j*2
   * rest = (sum * 10) % 11
   * Se rest =  10, o consideramos 0
   */

  const formattedCPF = cpf.replace(/\D/g, '') // remove all non digit chars

  if (formattedCPF.length !== 11 || /^(\d)\1+$/.test(formattedCPF)) {
    return false
  }

  const chars = Array.from(formattedCPF)

  // 1ª Validação
  const sumJ = chars
    .slice(0, 9)
    .reduce((acc, cur, i) => acc + Number(cur) * (10 - i), 0)

  const restJ = (sumJ * 10) % 11 === 10 ? 0 : (sumJ * 10) % 11

  if (restJ !== Number(formattedCPF.charAt(9))) return false

  // 2ª Validação
  const sumK = chars
    .slice(0, 10)
    .reduce((acc, cur, i) => acc + Number(cur) * (11 - i), 0)

  const restK = (sumK * 10) % 11 === 10 ? 0 : (sumK * 10) % 11

  if (restK !== Number(formattedCPF.charAt(10))) return false

  return true
}
