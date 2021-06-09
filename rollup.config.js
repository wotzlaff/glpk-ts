import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'GLPK',
    globals: {
      'glpk-wasm': 'glpkWasm',
    },
  },
  external: ['glpk-wasm'],
  plugins: [typescript({ tsconfig: './tsconfig.json' }), resolve(), commonjs()],
}
