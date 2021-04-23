import { expect } from 'chai'
import { Model, loadModule } from '../src/index'

before(() => loadModule())

describe('Model', () => {
  it('should get the right properties', () => {
    const model0 = new Model()
    expect(model0.sense).to.equal('min')
    expect(model0.name).to.equal('')

    const model1 = new Model({ sense: 'max' })
    expect(model1.sense).to.equal('max')
    model1.sense = 'min'
    expect(model1.sense).to.equal('min')

    const model2 = new Model({ name: 'fancy-model' })
    expect(model2.name).to.equal('fancy-model')
    model2.name = 'problem24'
    expect(model2.name).to.equal('problem24')
  })

  it('should not accept bad options', () => {
    // @ts-ignore
    expect(() => new Model({ sense: 'anything' })).to.throw(Error, "unknown sense 'anything'")
  })
})
