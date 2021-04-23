import { expect } from 'chai'
import { Model, loadModule, Variable } from '../src/index'

before(() => loadModule())

describe('Model', () => {
  it('should add simple variables', () => {
    const model = new Model()
    const x = model.addVar()
    expect(x).to.be.instanceOf(Variable)
    expect(model.vars).to.eql([x])

    expect(x).to.have.property('name')
    expect(x.name).to.be.a('string')
    expect(x.name).to.be.empty

    x.name = 'x'
    expect(x.name).to.equal('x')

    const y = model.addVar({ name: 'y', obj: 5 })
    expect(model.vars).to.eql([x, y])
    expect(y.name).to.equal('y')
    expect(y.obj).to.equal(5)

    y.bounds = [0, 1]
    expect(y.lb).to.equal(0)
    expect(y.ub).to.equal(1)
    y.bounds = [0, 1]

    y.lb = 5
    y.ub = 5
    expect(y.lb).to.equal(5)
    expect(y.ub).to.equal(5)
  })

  it('should add variables from complex descriptions', () => {
    const model = new Model()

    const x = model.addVars(3, { name: 'x' })
    expect(model.numVars).to.equal(3)
    expect(model.vars).to.eql(x)

    const y = model.addVars(2)
    expect(model.numVars).to.equal(3 + 2)
    expect(model.vars).to.eql([...x, ...y])

    const a = model.addVars(['p', 'q'])
    expect(model.numVars).to.equal(3 + 2 + 2)
    expect(model.vars).to.eql([...x, ...y, ...Object.values(a)])

    const b = model.addVars(['p', 'q'], { name: 'b', lb: 5, ub: 9, obj: 42, type: 'int' })
    expect(model.numVars).to.equal(3 + 2 + 2 + 2)
    expect(model.numInteger).to.equal(2)
    expect(model.vars).to.eql([...x, ...y, ...Object.values(a), ...Object.values(b)])

    expect(b.p).to.be.instanceOf(Variable)
    expect(b.q).to.be.instanceOf(Variable)
    expect(b.p.name).to.equal('b[p]')
    expect(b.q.name).to.equal('b[q]')
    expect([b.q.lb, b.q.ub, b.q.obj, b.q.type]).to.eql([5, 9, 42, 'integer'])
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
    expect(x.type).to.equal('binary')

    x.type = 'i'
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(1)
    expect(x.type).to.equal('binary')

    x.ub = 1
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(1)
    expect(x.type).to.equal('binary')

    x.ub = 5
    expect(model.numInteger).to.equal(1)
    expect(model.numBinary).to.equal(0)
    expect(x.type).to.equal('integer')

    const y = model.addVar({ type: 'integer', ub: 3 })
    expect(model.vars).to.eql([x, y])

    expect(model.numVars).to.equal(2)
    expect(model.numInteger).to.equal(2)
    expect(model.numBinary).to.equal(0)

    y.type = 'binary'
    expect(model.numInteger).to.equal(2)
    expect(model.numBinary).to.equal(1)
  })

  it('should be able to detect wrong inputs', () => {
    const model = new Model()
    const x = model.addVar()

    // @ts-ignore
    expect(() => (x.obj = '42')).to.throw(Error, 'obj should be a number')

    // @ts-ignore
    expect(() => model.addVar({ type: 'u' })).to.throw(Error, "unknown variable type 'u'")
  })
})
