
function getUniqueAttributes(model) {
  const attributes = model.attributes
  const uniqueAttrs = attributes.filter((attribute) => attribute.name !== 'id' && attribute.isUnique).map((a) => a.name)
  return uniqueAttrs
}

function areStrArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false
  }
  const str1 = JSON.stringify(arr1)
  const str2 = JSON.stringify(arr2)
  return str1 === str2
}

function hasUniqueColumnsChanged(previous, current) {
  const prevUA = getUniqueAttributes(previous).sort()
  const currentUA = getUniqueAttributes(current).sort()
  return !areStrArraysEqual(prevUA, currentUA)
}

module.exports = {
  areStrArraysEqual,
  getUniqueAttributes,
  hasUniqueColumnsChanged
}