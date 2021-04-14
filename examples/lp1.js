const { loadModule, Model } = require('..')

async function main() {
  await loadModule()
  const m = new Model()
  const [x, y] = m.addVars(2, { lb: 0.0, obj: -1.0, name: 'v' })
  m.addConstr({
    ub: 1.0,
    coeffs: [
      [x, 1.0],
      [y, 1.0],
    ],
  })

  m.simplex({ msgLevel: 'on' })

  console.log(m.toModelLP())
  console.log(`solution: x = ${x.value} (${x.type}), y = ${y.value}\nvalue = ${m.value}`)
}

main()
