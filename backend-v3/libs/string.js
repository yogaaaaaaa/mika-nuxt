'use strict'

function joinTemplateLiteral (templates, values) {
  const result = []
  let valueIndex = 0
  for (const string of templates) {
    result.push(string)
    if (values[valueIndex] !== undefined) {
      result.push(values[valueIndex])
      valueIndex++
    }
  }
  return result.join('')
}

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
  normalizeSpace: (...strings) => {
    const templates = strings.shift()
    const values = strings
    return exports.whitespaceTrim(joinTemplateLiteral(templates, values), true, true)
  }
}
