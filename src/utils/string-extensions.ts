/* eslint-disable no-extend-native */
String.prototype.capitalizeFirstLetter = function (): string {
  return this.split(' ')
    .map((word) => {
      return (
        word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
      )
    })
    .join(' ')
}
