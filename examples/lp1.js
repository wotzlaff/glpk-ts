const { loadModule, Model } = require('..')

async function main() {
  await loadModule()
  const m = new Model()
  const [x, y] = m.addVars(2, { lb: 0.0, obj: -1.0 })
  m.addConstr({
    ub: 1.0,
    coeffs: [
      [x, 1.0],
      [y, 1.0],
    ],
  })

  m.simplex({ msgLevel: 'all' })

  console.log(m.toModelLP())
}

main()
