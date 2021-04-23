import { expect } from 'chai'
import { Model, loadModule } from '../src/index'

before(() => loadModule())

const TOL = 1e-6

describe('simplex', () => {
  it('should solve a simple problem', () => {
    const model = new Model()
    expect(model.sense).to.equal('min')

    const x = model.addVars(2, { lb: 0, obj: 1 })

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
  })

  it('should solve another simple problem', () => {
    const model = new Model({ sense: 'max' })
    expect(model.sense).to.equal('max')

    const x = model.addVars(2, { lb: 0, obj: 1 })

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
  })

  it('should be able to detect unboundedness', () => {
    const model = new Model({ sense: 'max' })
    const x = model.addVar({ obj: 0.1 })

    const code = model.simplex({ msgLevel: 'off' })
    expect(code).to.equal('ok')
    expect(model.status).to.equal('unbounded')
    expect(model.statusPrimal).to.equal('feasible')
    expect(model.statusDual).to.equal('no_feasible')
  })

  it('should not accept bad options', () => {
    const model = new Model()
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
  })
})
