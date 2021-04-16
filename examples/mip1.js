const { loadModule, Model } = require('..')

loadModule().then(() => {
  const m = new Model({ sense: 'max' })
  const [x1, x2] = m.addVars(2, { lb: 0, name: 'x', type: 'int' })
  x1.obj = 80
  x2.obj = 60
  m.addConstrs([
    {
      ub: 16,
      coeffs: [
        [x1, 2],
        [x2, 2],
      ],
    },
    {
      ub: 24,
      coeffs: [
        [x1, 4],
        [x2, 2],
      ],
    },
    {
      ub: 36,
      coeffs: [
        [x1, 4],
        [x2, 6],
      ],
    },
  ])

  m.simplex({
    msgLevel: 'off',
  })
  console.log(m.solution)

  m.intopt({
    msgLevel: 'all',
    presolve: true,
  })
  console.log(m.solutionMIP)
})
