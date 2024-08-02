/* eslint-disable no-extend-native */
console.log('String extended methods')
String.prototype.capitalizeFirstLetter = function (): string {
  return this.replace(/\b\w+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
}
