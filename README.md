# GLPK interface for TypeScript powered by WebAssembly

This is WIP.

## Example

```js
const { loadModule, Model } = require('glpk-ts')

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
```

## Documentation

[Documentation](https://glpk-ts.surge.sh)

## Coverage report

You can find the report [here](https://glpk-ts.surge.sh/coverage).
