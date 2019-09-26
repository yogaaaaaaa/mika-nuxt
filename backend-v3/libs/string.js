'use strict'

module.exports.whitespaceTrim = (string, newLineToSpace, singleSpace) => {
  if (newLineToSpace) {
    string = string.replace(/[\n\r]+/g, ' ')
  }
  if (singleSpace) {
    string = string.replace(/ {1,}/g, ' ')
  }
  return string
}

module.exports.templateTags = {
  normalizeSpace: (strings) => exports.whitespaceTrim(strings.join(), true, true)
}
