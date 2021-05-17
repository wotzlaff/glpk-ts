import { expect } from 'chai'
import { Model, loadModule, Variable } from '../src/index'

before(() => loadModule())

const TOL = 1e-6

describe('simplex', () => {
  it('should solve a simple problem', () => {
    const model = new Model()
    expect(model.sense).to.equal('min')

    const x = model.addVars(2, { lb: 0, obj: 1, name: 'x' })

    const s0 = model.addConstr()
    s0.setBounds(1, 1)
    s0.add([
      [x[0], 1],
      [x[1], 2],
    ])

    expect(model.status).to.equal('undefined')
    expect(model.statusPrimal).to.equal('undefined')
    expect(model.statusDual).to.equal('undefined')

    const code0 = model.simplex({ msgLevel: 'off' })
    expect(code0).to.equal('ok')
    expect(model.status).to.equal('optimal')
    expect(model.statusPrimal).to.equal('feasible')
    expect(model.statusDual).to.equal('feasible')
    expect(model.value).to.be.closeTo(0.5, TOL)

    // check primal values
    expect(s0.value).to.be.closeTo(1, TOL)
    expect(x[0].value).to.be.closeTo(0, TOL)
    expect(x[1].value).to.be.closeTo(0.5, TOL)
    // check dual values
    expect(s0.dual).to.be.closeTo(0.5, TOL)
    expect(x[0].dual).to.be.closeTo(0.5, TOL)
    expect(x[1].dual).to.be.closeTo(0, TOL)
    // check status
    expect(x[0].status).to.equal('lower-bound')
    expect(x[1].status).to.equal('basic')
    expect(s0.status).to.equal('fixed')

    model.sense = 'max'
    const code1 = model.simplex({ msgLevel: 'off' })
    expect(code1).to.equal('ok')
    expect(model.status).to.equal('optimal')
    expect(model.statusPrimal).to.equal('feasible')
    expect(model.statusDual).to.equal('feasible')
    expect(model.value).to.be.closeTo(1, TOL)

    // check primal values
    expect(s0.value).to.be.closeTo(1, TOL)
    expect(x[0].value).to.be.closeTo(1, TOL)
    expect(x[1].value).to.be.closeTo(0, TOL)
    // check dual values
    expect(s0.dual).to.be.closeTo(1, TOL)
    expect(x[0].dual).to.be.closeTo(0, TOL)
    expect(x[1].dual).to.be.closeTo(-1, TOL)
    // check status
    expect(x[0].status).to.equal('basic')
    expect(x[1].status).to.equal('lower-bound')
    expect(s0.status).to.equal('fixed')

    expect(model.solution).to.equal('status = optimal\nx_0 = 1\nx_1 = 0\nvalue = 1')

    expect(() => model.ray).to.throw(Error, 'no unbounded ray')
  })

  it('should solve another simple problem', () => {
    const model = new Model({ sense: 'max' })
    expect(model.sense).to.equal('max')

    const x = model.addVars(2, { lb: 0, obj: 1, name: 'x' })

    const s0 = model.addConstr({
      ub: 1,
      coeffs: [
        [x[0], 1],
        [x[1], 2],
      ],
    })

    const code = model.simplex({ msgLevel: 'off' })
    expect(code).to.equal('ok')
    expect(model.status).to.equal('optimal')
    expect(model.statusPrimal).to.equal('feasible')
    expect(model.statusDual).to.equal('feasible')

    // check primal values
    expect(x[0].value).to.be.closeTo(1, TOL)
    expect(x[1].value).to.be.closeTo(0, TOL)
    expect(s0.value).to.be.closeTo(1, TOL)
    // check dual values
    expect(x[0].dual).to.be.closeTo(0, TOL)
    expect(x[1].dual).to.be.closeTo(-1, TOL)
    expect(s0.dual).to.be.closeTo(1, TOL)
    // check status
    expect(x[0].status).to.equal('basic')
    expect(x[1].status).to.equal('lower-bound')
    expect(s0.status).to.equal('upper-bound')

    expect(model.solution).to.equal('status = optimal\nx_0 = 1\nx_1 = 0\nvalue = 1')
  })

  it('should be able to detect unboundedness', () => {
    const model = new Model({ sense: 'max' })
    const x = model.addVar({ obj: 0.1 })

    const code = model.simplex({ msgLevel: 'off', method: 'primal' })
    expect(code).to.equal('ok')
    expect(model.status).to.equal('unbounded')
    expect(model.statusPrimal).to.equal('feasible')
    expect(model.statusDual).to.equal('no_feasible')
    expect(model.ray).to.equal(x)
    expect(model.solution).to.equal('problem is unbounded')
  })

  it('should be able to detect infeasibility', () => {
    const model = new Model()
    const x = model.addVar({ lb: 1, obj: 0.1 })
    const c = model.addConstr({ ub: 0, coeffs: [[x, 1]] })

    const code = model.simplex({ msgLevel: 'off', method: 'dual' })
    expect(code).to.equal('ok')
    expect(model.status).to.equal('no_feasible')
    expect(model.statusPrimal).to.equal('no_feasible')
    expect(model.statusDual).to.equal('feasible')
    expect(model.ray).to.equal(c)
    expect(model.solution).to.equal('problem has no feasible solution')
  })

  it('should accept all options', () => {
    const model = new Model()
    const x = model.addVars(2, { lb: 0, obj: 1, name: 'x' })
    model.addConstr({
      ub: 1,
      coeffs: [
        [x[0], 1],
        [x[1], 2],
      ],
    })

    model.simplex()

    model.simplex({
      msgLevel: 'off',
      method: 'dual_primal',
      pricing: 'pse',
      ratioTest: 'flipflop',
      tolPrimal: 1e-6,
      tolDual: 1e-5,
      tolPivot: 1e-8,
      objLower: -25,
      objUpper: 25,
      limitIter: 100,
      limitTime: 1000,
      logFreq: 1,
      logDelay: 0,
      presolve: false,
    })

    model.simplex({
      msgLevel: 'off',
      method: 'dual_primal',
      pricing: 'pse',
      ratioTest: 'flipflop',
      tolPrimal: 1e-6,
      tolDual: 1e-5,
      tolPivot: 1e-8,
      objLower: -25,
      objUpper: 25,
      limitIter: 100,
      limitTime: 1000,
      logFreq: 1,
      logDelay: 0,
      presolve: true,
    })
  })

  it('should stop on limit', () => {
    const model = new Model()
    const n = 100
    const x = model.addVars(n, { obj: -1 })
    model.addConstrs(
      Array.from(Array(n).keys(), j => {
        return { lb: 0, ub: 1, coeffs: x.map((xi, i) => <[Variable, number]>[xi, i == j ? 2 : 1]) }
      })
    )

    expect(model.simplex({ msgLevel: 'off', limitIter: 1 })).to.equal('iteration_limit')
    expect(model.simplex({ msgLevel: 'off', limitTime: 1 })).to.equal('time_limit')
  })

  it('should detect incorrect bounds', () => {
    const model = new Model()
    model.addVar()
    model.addConstr({ lb: 1, ub: 0 })
    expect(model.simplex({ msgLevel: 'off' })).to.equal('bounds_incorrect')
  })

  it('should not accept bad options', () => {
    const model = new Model()

    expect(() => model.solution).to.throw(Error, "status is 'undefined', run simplex first")

    // @ts-ignore
    expect(() => model.simplex({ msgLevel: 'none' })).to.throw(
      Error,
      "unknown message level 'none'"
    )
    // @ts-ignore
    expect(() => model.simplex({ method: 'primaldual' })).to.throw(
      Error,
      "unknown method 'primaldual'"
    )
    // @ts-ignore
    expect(() => model.simplex({ pricing: 'random' })).to.throw(Error, "unknown pricing 'random'")
    // @ts-ignore
    expect(() => model.simplex({ ratioTest: 'random' })).to.throw(
      Error,
      "unknown ratioTest 'random'"
    )
  })
})
