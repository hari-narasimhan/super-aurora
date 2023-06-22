'use strict';

const { areStrArraysEqual } = require('../lib/GeneratorFactory/util');


describe('compare string arrays', () => {
  it('Should return true when arrays are equal', () => {
    const arr1 = ['a', 'b']
    const arr2 = ['a', 'b']

    const result = areStrArraysEqual(arr1, arr2)
    expect(result).toBe(true)
  })

  it('Should return false when arrays are equal', () => {
    const arr1 = ['a', 'b']
    const arr2 = ['a', 'c']

    const result = areStrArraysEqual(arr1, arr2)
    expect(result).toBe(false)
  })

  it('Should return false when arrays are equal', () => {
    const arr1 = ['a', 'b']
    const arr2 = ['a', 'b', 'c']

    const result = areStrArraysEqual(arr1, arr2)
    expect(result).toBe(false)
  })
})

