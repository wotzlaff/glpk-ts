const { loadModule, Model } = require('..')

loadModule().then(() => {
  const m = new Model()
  const [x, y] = m.addVars(2, { lb: 0.0, obj: -1.0 })
  m.addConstr({
    ub: 1.0,
    coeffs: [
      [x, 1.0],
      [y, 1.0],
    ],
  })

  m.simplex()
  console.log(`x = ${x.value}, y = ${y.value}`)
})
