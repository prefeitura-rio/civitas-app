/* eslint-disable no-extend-native */

// Função utilitária para capitalizar primeira letra
export function capitalizeFirstLetter(str: string): string {
  return str
    .split(' ')
    .map((word) => {
      return (
        word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
      )
    })
    .join(' ')
}

// Extensão do protótipo para compatibilidade
declare global {
  interface String {
    capitalizeFirstLetter(): string
  }
}

String.prototype.capitalizeFirstLetter = function (this: string): string {
  return capitalizeFirstLetter(this)
}
