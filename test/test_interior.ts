import { expect } from 'chai'
import { Model, loadModule } from '../src/index'

before(() => loadModule())

const TOL = 1e-6

describe('interior', () => {
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

    expect(model.statusInt).to.equal('undefined')

    const code0 = model.interior({ msgLevel: 'off' })
    expect(code0).to.equal('ok')
    expect(model.statusInt).to.equal('optimal')
    expect(model.valueInt).to.be.closeTo(0.5, TOL)

    // check primal values
    expect(s0.valueInt).to.be.closeTo(1, TOL)
    expect(x[0].valueInt).to.be.closeTo(0, TOL)
    expect(x[1].valueInt).to.be.closeTo(0.5, TOL)
    // check dual values
    expect(s0.dualInt).to.be.closeTo(0.5, TOL)
    expect(x[0].dualInt).to.be.closeTo(0.5, TOL)
    expect(x[1].dualInt).to.be.closeTo(0, TOL)

    model.sense = 'max'
    const code1 = model.interior({ msgLevel: 'off' })
    expect(code1).to.equal('ok')
    expect(model.statusInt).to.equal('optimal')
    expect(model.valueInt).to.be.closeTo(1, TOL)

    // check primal values
    expect(s0.valueInt).to.be.closeTo(1, TOL)
    expect(x[0].valueInt).to.be.closeTo(1, TOL)
    expect(x[1].valueInt).to.be.closeTo(0, TOL)
    // check dual values
    expect(s0.dualInt).to.be.closeTo(1, TOL)
    expect(x[0].dualInt).to.be.closeTo(0, TOL)
    expect(x[1].dualInt).to.be.closeTo(-1, TOL)

    expect(model.solutionInt).to.equal('status = optimal\nx_0 = 1\nx_1 = 0\nvalue = 1')
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

    const code = model.interior({ msgLevel: 'off' })
    expect(code).to.equal('ok')
    expect(model.statusInt).to.equal('optimal')

    // check primal values
    expect(x[0].valueInt).to.be.closeTo(1, TOL)
    expect(x[1].valueInt).to.be.closeTo(0, TOL)
    expect(s0.valueInt).to.be.closeTo(1, TOL)
    // check dual values
    expect(x[0].dualInt).to.be.closeTo(0, TOL)
    expect(x[1].dualInt).to.be.closeTo(-1, TOL)
    expect(s0.dualInt).to.be.closeTo(1, TOL)

    expect(model.solutionInt).to.equal('status = optimal\nx_0 = 1\nx_1 = 0\nvalue = 1')
  })

  it('should fail on unboundedness', () => {
    const model = new Model({ sense: 'max' })
    const x = model.addVar({ obj: 0.1 })

    const code = model.interior({ msgLevel: 'off' })
    expect(code).to.equal('no_data')
    expect(model.statusInt).to.equal('undefined')
  })

  it('should be able to detect infeasibility', () => {
    const model = new Model()
    const x = model.addVar({ lb: 1, obj: 0.1 })
    const c = model.addConstr({ ub: 0, coeffs: [[x, 1]] })

    const code = model.interior({ msgLevel: 'off' })
    expect(code).to.equal('ok')
    expect(model.statusInt).to.equal('no_feasible')
    expect(model.solutionInt).to.equal('problem has no feasible solution')
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

    model.interior({
      msgLevel: 'off',
      ordering: 'amd',
    })
  })

  it('should not accept bad options', () => {
    const model = new Model()

    expect(() => model.solutionInt).to.throw(Error, "status is 'undefined', run interior first")

    // @ts-ignore
    expect(() => model.interior({ msgLevel: 'none' })).to.throw(
      Error,
      "unknown message level 'none'"
    )
    // @ts-ignore
    expect(() => model.interior({ ordering: 'random' })).to.throw(
      Error,
      "unknown ordering 'random'"
    )
  })
})
