import { expect } from 'chai'
import { Model, loadModule, Constraint, Variable } from '../src/index'

before(() => loadModule())

describe('Constraint', () => {
  it('should add simple constaints', () => {
    const model = new Model()
    const c = model.addConstr()
    expect(c).to.be.instanceOf(Constraint)
    expect(model.constrs).to.eql([c])

    expect(c).to.have.property('name')
    expect(c.name).to.be.a('string')
    expect(c.name).to.be.empty

    c.name = 'c'
    expect(c.name).to.equal('c')

    const d = model.addConstr({ name: 'd', lb: -5, ub: 5 })
    expect(model.constrs).to.eql([c, d])
    expect(d.name).to.equal('d')
    expect(d.lb).to.equal(-5)
    expect(d.ub).to.equal(5)

    d.bounds = [0, 1]
    expect(d.lb).to.equal(0)
    expect(d.ub).to.equal(1)
    d.bounds = [0, 1]

    d.lb = 5
    d.ub = 5
    expect(d.lb).to.equal(5)
    expect(d.ub).to.equal(5)
  })

  it('should add coefficients', () => {
    const model = new Model()
    const x = model.addVars(2)
    const c = model.addConstr()
    c.add(x[0], 1)
    model.simplex({ msgLevel: 'off' })
    expect(c.row).to.eql([[x[0], 1]])
    c.add(x[0], 1)
    model.simplex({ msgLevel: 'off' })
    expect(c.row).to.eql([[x[0], 2]])
    c.add([
      [x[0], -2],
      [x[1], 3],
    ])
    model.simplex({ msgLevel: 'off' })
    expect(c.row).to.eql([[x[1], 3]])

    c.add(x[1], -3)

    const coeffMap = new Map<Variable, number>()
    coeffMap.set(x[0], 5)
    coeffMap.set(x[1], 2)
    c.add(coeffMap)
    model.simplex({ msgLevel: 'off' })
    expect(c.row).to.eql([
      [x[0], 5],
      [x[1], 2],
    ])

    expect(c.add(x[0], 0)).to.equal(c)
    expect(c.add([[x[0], 0]])).to.equal(c)
  })

  it('should not except wrong coefficients', () => {
    const model = new Model()
    const c = model.addConstr()
    const x = model.addVar()
    //@ts-ignore
    expect(() => c.add('x', 1)).to.throw(Error, 'variable should have type Variable')

    //@ts-ignore
    expect(() => c.add('x')).to.throw(Error, 'coeffs should have type Array or Map')

    //@ts-ignore
    expect(() => c.add(['x', 1])).to.throw(Error, 'variable should have type Variable')
    //@ts-ignore
    expect(() => c.add([['x', 1]])).to.throw(Error, 'variable should have type Variable')
  })
})
