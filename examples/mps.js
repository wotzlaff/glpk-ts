const { loadModule, Model } = require('..')

loadModule().then(() => {
  const m = new Model({ sense: 'min' })
  const x = m.addVars([
    { lb: 0, obj: -5, name: 'x1' },
    { lb: 0, obj: -4, name: 'x2' },
    { lb: 0, obj: -3, name: 'x3' },
  ])

  m.addConstrs([
    {
      ub: 5,
      coeffs: [
        [x[0], 2],
        [x[1], 3],
        [x[2], 1],
      ],
      name: 'x4',
    },
    {
      ub: 11,
      coeffs: [
        [x[0], 4],
        [x[1], 1],
        [x[2], 2],
      ],
      name: 'x5',
    },
    {
      ub: 8,
      coeffs: [
        [x[0], 3],
        [x[1], 4],
        [x[2], 2],
      ],
      name: 'x6',
    },
  ])
  m.name = 'first_example'
  m.simplex()
  console.log(m.solution)

  m.update()
  const data = m.toMPS()
  console.log(data)

  const m2 = Model.fromMPS(data)

  m2.simplex()
  console.log(m2.solution)
})
