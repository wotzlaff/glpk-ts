import { expect } from 'chai'
import { Model, loadModule } from '../src/index'

before(() => loadModule())

const TOL = 1e-6

describe('evalTab', () => {
  beforeEach(function () {
    //@ts-ignore
    this.currentTest.model = new Model()
  })

  it('should compute a column and a row of the simplex tableau', function () {
    //@ts-ignore
    const model = <Model>this.test.model
    model.sense = 'max'
    const x = model.addVars([
      { lb: 0, obj: 1 },
      { lb: 0, obj: 2 },
    ])
    const s = model.addConstrs([
      {
        ub: 2,
        coeffs: [
          [x[0], 1],
          [x[1], 2],
        ],
      },
      {
        ub: 2,
        coeffs: [
          [x[0], 2],
          [x[1], 1],
        ],
      },
    ])

    model.simplex({ msgLevel: 'off' })

    expect(model.value).to.equal(2)

    expect(x[0].value).to.equal(0)
    expect(x[1].value).to.equal(1)

    // get column of non-basic variable
    expect(x[0].status).to.equal('lower-bound')
    expect(x[0].column).to.eql([
      [x[1], -0.5],
      [s[1], 1.5],
    ])

    // get row of basic variable
    expect(x[1].status).to.equal('basic')
    expect(x[1].row).to.eql([
      [s[0], 0.5],
      [x[0], -0.5],
    ])

    expect(s[0].value).to.equal(2)
    expect(s[1].value).to.equal(1)

    // get column of non-basic slack
    expect(s[0].status).to.equal('upper-bound')
    expect(s[0].column).to.eql([
      [x[1], 0.5],
      [s[1], 0.5],
    ])

    // get row of basic slack
    expect(s[1].status).to.equal('basic')
    expect(s[1].row).to.eql([
      [s[0], 0.5],
      [x[0], 1.5],
    ])
  })
})
