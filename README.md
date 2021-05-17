# GLPK interface for TypeScript powered by WebAssembly

We aim to provide an easy-to-use interface to [GLPK](https://www.gnu.org/software/glpk/) which works out of the box.
Of course, Javascript is not the best choice for a modeling language.
Nevertheless it might be a suitable alternative for some applications because it runs on almost any machine (in the browser) without dditional dependencies and setup.

## Installation

Using the usual command

```sh
npm install glpk-ts
```

you should get the library together with its wasm-dependency.

## Example

```js
const { loadModule, Model } = require('glpk-ts')

loadModule().then(() => {
  const m = new Model()
  // create 2 non-negative variables
  const [x, y] = m.addVars(2, { lb: 0.0, obj: -1.0 })
  // add the constraint x + y <= 1
  m.addConstr({
    ub: 1.0,
    coeffs: [
      [x, 1.0],
      [y, 1.0],
    ],
  })
  // let the simplex method solve the problem
  m.simplex()
  console.log(`x = ${x.value}, y = ${y.value}`)
})
```

## Documentation

You can find the documentation [here](https://glpk-ts.surge.sh).

## Performance

Below you can find a table with some runtime stats which I obtained on my local machine (i7-4790K running Ubuntu 20.04.2).
The benchmark instances are taken from the [Netlib Repository](https://www.netlib.org/lp/data/).
Please have a look at [this repository](https://github.com/wotzlaff/glpk-netlib) if you want to try it on your own machine.

If you have any idea why NodeJS is performing so great, please give me a hint.

|  | NodeJS<br>v14.17.0 | Chrome<br>90.0.4430.212 | Firefox <br>88.0.1 | C++ (ref)<br>GLPK 4.65 | PyGLPK (ref)<br>GLPK 4.65 |
|-|-|-|-|-|-|
| 25fv47 | 23.0 | 433.6 | 463.0 | 186.8 | 185.7 |
| 80bau3b | 78.0 | 1589.4 | 1048.0 | 582.4 | 574.8 |
| adlittle | 0.1 | 2.8 | 1.0 | 0.7 | 0.8 |
| afiro | 0.0 | 0.2 | 0.0 | 0.1 | 0.1 |
| agg | 0.1 | 5.3 | 4.0 | 2.0 | 2.7 |
| agg2 | 0.1 | 6.2 | 4.0 | 2.1 | 2.5 |
| agg3 | 0.0 | 7.0 | 6.0 | 2.1 | 2.3 |
| bandm | 2.1 | 49.9 | 36.0 | 19.7 | 20.6 |
| beaconfd | 0.1 | 4.3 | 3.0 | 1.4 | 1.6 |
| blend | 0.1 | 1.9 | 1.0 | 0.5 | 0.6 |
| bnl1 | 5.1 | 115.1 | 78.0 | 44.1 | 44.9 |
| bnl2 | 58.0 | 1027.9 | 745.0 | 427.9 | 428.4 |
| boeing1 | 1.1 | 23.3 | 17.0 | 9.1 | 9.0 |
| boeing2 | 0.0 | 4.2 | 4.0 | 1.6 | 1.7 |
| bore3d | 0.0 | 7.0 | 6.0 | 2.4 | 2.5 |
| brandy | 1.0 | 22.8 | 17.0 | 8.0 | 8.2 |
| capri | 0.0 | 12.0 | 8.0 | 4.1 | 5.4 |
| cycle | 24.0 | 453.6 | 323.0 | 169.5 | 181.0 |
| czprob | 10.0 | 215.6 | 151.0 | 77.7 | 78.3 |
| d2q06c | 209.1 | 3833.0 | 2836.0 | 1701.7 | 1728.5 |
| d6cube | 71.1 | 1400.8 | 1056.0 | 557.5 | 557.9 |
| degen2 | 3.1 | 69.2 | 48.0 | 26.0 | 28.2 |
| degen3 | 42.0 | 799.7 | 594.0 | 340.1 | 337.0 |
| dfl001 | 3408.1 | 55618.9 | 43681.0 | 28133.9 | 26272.0 |
| e226 | 0.0 | 16.0 | 13.0 | 9.4 | 6.6 |
| etamacro | 1.0 | 26.4 | 22.0 | 9.0 | 9.2 |
| fffff800 | 2.1 | 43.4 | 43.0 | 15.0 | 16.1 |
| finnis | 1.0 | 23.3 | 18.0 | 7.8 | 8.1 |
| fit1d | 2.1 | 56.1 | 43.0 | 21.7 | 21.0 |
| fit1p | 7.0 | 168.2 | 114.0 | 56.1 | 56.8 |
| fit2d | 301.1 | 6178.8 | 4822.0 | 2482.1 | 2427.5 |
| fit2p | 475.1 | 9876.5 | 6659.0 | 3510.5 | 3516.4 |
| forplan | 0.1 | 12.2 | 10.0 | 4.5 | 5.2 |
| ganges | 6.0 | 141.4 | 99.0 | 45.3 | 44.7 |
| gfrd-pnc | 1.1 | 47.9 | 29.0 | 14.1 | 14.1 |
| greenbea | 129.0 | 2390.1 | 1900.0 | 993.9 | 990.8 |
| greenbeb | 102.1 | 1932.2 | 1368.0 | 780.9 | 780.7 |
| grow15 | 2.1 | 52.2 | 38.0 | 20.4 | 18.7 |
| grow22 | 6.0 | 125.0 | 92.0 | 44.7 | 46.1 |
| grow7 | 0.0 | 14.8 | 11.0 | 5.3 | 5.3 |
| israel | 0.0 | 7.2 | 5.0 | 2.5 | 2.6 |
| kb2 | 0.0 | 1.6 | 1.0 | 0.4 | 0.5 |
| lotfi | 0.1 | 3.8 | 3.0 | 1.3 | 1.4 |
| maros-r7 | 206.1 | 3609.4 | 2988.0 | 1400.2 | 1407.4 |
| maros | 16.1 | 276.7 | 241.0 | 113.0 | 111.9 |
| modszk1 | 6.1 | 118.2 | 83.0 | 42.6 | 43.9 |
| nesm | 26.1 | 485.0 | 353.0 | 198.4 | 198.3 |
| perold | 24.1 | 384.0 | 279.0 | 157.5 | 158.1 |
| pilot.ja | 76.1 | 1191.9 | 903.0 | 510.5 | 512.5 |
| pilot | 258.1 | 4654.1 | 3617.0 | 1905.2 | 1901.8 |
| pilot.we | 28.0 | 502.9 | 362.0 | 205.2 | 210.1 |
| pilot4 | 8.1 | 151.6 | 111.0 | 64.5 | 63.7 |
| pilot87 | 636.0 | 12021.3 | 9820.0 | 5359.6 | 4743.4 |
| pilotnov | 25.0 | 487.1 | 362.0 | 215.1 | 201.6 |
| recipe | 0.0 | 0.6 | 0.0 | 0.2 | 0.3 |
| sc105 | 0.1 | 2.2 | 1.0 | 0.5 | 0.6 |
| sc205 | 0.0 | 13.2 | 6.0 | 4.4 | 2.8 |
| sc50a | 0.0 | 0.4 | 0.0 | 0.2 | 0.2 |
| sc50b | 0.0 | 0.5 | 0.0 | 0.3 | 0.2 |
| scagr25 | 1.1 | 36.2 | 25.0 | 17.2 | 12.6 |
| scagr7 | 0.1 | 3.4 | 2.0 | 1.5 | 1.3 |
| scfxm1 | 1.0 | 23.2 | 14.0 | 8.0 | 7.5 |
| scfxm2 | 3.0 | 69.6 | 45.0 | 27.1 | 24.8 |
| scfxm3 | 7.1 | 142.3 | 100.0 | 49.0 | 50.2 |
| scorpion | 0.0 | 12.5 | 9.0 | 5.5 | 4.2 |
| scrs8 | 2.0 | 55.4 | 38.0 | 19.1 | 20.5 |
| scsd1 | 0.0 | 4.3 | 2.0 | 1.6 | 1.6 |
| scsd6 | 0.0 | 17.9 | 12.0 | 6.6 | 6.8 |
| scsd8 | 5.0 | 104.8 | 73.0 | 37.7 | 38.7 |
| sctap1 | 0.1 | 21.0 | 10.0 | 5.9 | 6.2 |
| sctap2 | 9.1 | 192.0 | 129.0 | 69.3 | 70.2 |
| sctap3 | 15.1 | 291.8 | 206.0 | 110.2 | 112.8 |
| seba | 1.0 | 35.4 | 24.0 | 11.4 | 12.1 |
| share1b | 0.1 | 7.4 | 6.0 | 2.8 | 3.2 |
| share2b | 0.1 | 1.5 | 1.0 | 0.6 | 0.6 |
| shell | 1.0 | 39.5 | 24.0 | 11.8 | 12.7 |
| ship04l | 1.0 | 24.2 | 16.0 | 9.6 | 7.5 |
| ship04s | 0.1 | 20.2 | 12.0 | 10.2 | 5.9 |
| ship08l | 4.1 | 94.8 | 54.0 | 26.8 | 30.0 |
| ship08s | 3.1 | 56.8 | 31.0 | 15.0 | 16.5 |
| ship12l | 7.0 | 170.6 | 100.0 | 45.8 | 47.4 |
| ship12s | 4.1 | 108.5 | 66.0 | 29.6 | 30.0 |
| sierra | 3.0 | 72.6 | 44.0 | 20.9 | 22.0 |
| stair | 2.1 | 54.2 | 40.0 | 18.2 | 18.7 |
| standata | 0.0 | 3.1 | 3.0 | 1.1 | 1.1 |
| standmps | 0.0 | 16.4 | 10.0 | 4.7 | 5.5 |
| stocfor1 | 0.1 | 3.1 | 1.0 | 0.6 | 0.7 |
| stocfor2 | 16.1 | 335.9 | 231.0 | 113.9 | 113.7 |
| tuff | 1.0 | 32.9 | 21.0 | 10.6 | 11.3 |
| vtp.base | 0.1 | 7.2 | 5.0 | 2.9 | 2.6 |
| wood1p | 5.1 | 134.0 | 106.0 | 43.7 | 41.7 |
| woodw | 22.0 | 440.5 | 293.0 | 162.6 | 157.6 |

## Applications

Let me know if you are planning to use `glpk-ts` for your application.

## Coverage report

You can find the report [here](https://glpk-ts.surge.sh/coverage).
