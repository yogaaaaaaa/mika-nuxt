export const convertToFormField = originalData => {
  const modifiedData = []
  originalData.map(od => {
    const item = {}
    item.range = od.range
    Object.keys(od).map(key => {
      Object.keys(od[key]).map(k => {
        if (!item[`${key}.${k}`]) item[`${key}.${k}`] = od[key][k]
      })
    })
    modifiedData.push(item)
  })
  return modifiedData
}

export const revertToDbData = modifiedData => {
  const result = {}
  result.range = modifiedData.range
  delete modifiedData['range']
  Object.keys(modifiedData).map(key => {
    const splitKey = key.split('.')
    if (splitKey[0] !== 'range') {
      if (!result[splitKey[0]]) result[splitKey[0]] = {}
      if (!result[splitKey[0]][splitKey[1]])
        result[splitKey[0]][splitKey[1]] = {}
      result[splitKey[0]][splitKey[1]] = parseInt(modifiedData[key])
    }
  })
  return result
}

export const prepareUpdateData = (storeData, subData, newData) => {
  const currentData = Object.assign({}, storeData)
  const data = [...currentData[subData]]
  const index = data.findIndex(f => f.range === newData.range)
  if (index !== -1) {
    data.splice(index, 1, newData)
    currentData[subData] = data
    return currentData
  }
  return storeData
}
