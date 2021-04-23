import { expect } from 'chai'
import { Model, loadModule } from '../src/index'

before(() => loadModule())

describe('simplex', () => {
  it('should solve a simple problem', () => {
    const model = new Model()
    expect(model.sense).to.equal('min')
  })
})
