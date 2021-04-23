import { expect } from 'chai'
import { Model, loadModule, Variable } from '../src/index'

before(() => loadModule())

describe('Model', () => {
  it('should get simple variables', () => {
    const model = new Model()
    const x = model.addVar()
    expect(x).to.be.instanceOf(Variable)
    expect(x).to.have.property('name')
    expect(x.name).to.be.a('string')
    expect(x.name).to.be.empty

    x.name = 'x'
    expect(x.name).to.equal('x')

    expect(model.vars).to.have.ordered.members([x])
  })

  it('should count binary and integer variables', () => {
    const model = new Model()
    expect(model.numVars).to.equal(0)
    expect(model.numInteger).to.equal(0)
    expect(model.numBinary).to.equal(0)

    const x = model.addVar()
    expect(model.numVars).to.equal(1)
    expect(model.numInteger).to.equal(0)
    expect(model.numBinary).to.equal(0)

    x.type = 'b'
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(1)

    x.type = 'i'
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(1)

    x.ub = 1
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(1)

    x.ub = 5
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(0)

    const y = model.addVar({ type: 'integer', ub: 3 })
    expect(model.vars).to.have.ordered.members([x, y])

    expect(model.numVars).to.equal(2)
    expect(model.numInteger).to.equal(2)
    expect(model.numBinary).to.equal(0)

    y.type = 'binary'
    expect(model.numInteger).to.equal(2)
    expect(model.numBinary).to.equal(1)
  })
})
