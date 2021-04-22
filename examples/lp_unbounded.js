const { loadModule, Model, Variable, Constraint } = require('../dist')

async function main() {
  await loadModule()
  const m = new Model({ sense: 'max' })
  const x = m.addVars(2, { lb: 0, obj: 1, name: 'x' })
  const c = m.addConstrs([
    {
      lb: 2,
      coeffs: [
        [x[0], 1],
        [x[1], 1],
      ],
    },
    {
      lb: 0,
      coeffs: [
        [x[0], 2],
        [x[1], -1],
      ],
    },
    {
      lb: 0,
      coeffs: [
        [x[0], -1],
        [x[1], 2],
      ],
    },
  ])
  c[0].name = 'c_0'
  c[1].name = 'c_1'
  c[2].name = 'c_2'

  m.simplex({ msgLevel: 'on' })

  console.log(m.solution)

  const v = m.ray
  console.log(
    'Unbounded ray:',
    v.name,
    '=',
    v.column.map(([u, val]) => `${val} * ${u.name}`).join(' + '),
    '+',
    v.dual
  )
}

main()
