import { expect } from 'chai'
import { Model } from '../src/index'

describe('Module', () => {
  expect(() => {
    const m = new Model()
  }).to.throw(Error, 'wasm module not loaded')
})
