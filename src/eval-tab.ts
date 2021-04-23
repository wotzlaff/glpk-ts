import { mod } from './module'
import { Constraint } from './constraint'
import { Variable } from './variable'

export function evalTabRow(v: Variable | Constraint): [Variable | Constraint, number][] {
  const m = v.model.numConstrs
  const n = v.model.numVars
  const mem = mod._malloc((n + 1) * (8 + 4))

  let coeffs = new Float64Array(mod.HEAPU8.buffer, <number>mem, n + 1)
  let idxs = new Int32Array(mod.HEAPU8.buffer, <number>mem + (n + 1) * 8, n + 1)

  mod._glp_eval_tab_row(
    v.model.ptr,
    v instanceof Variable ? m + v.id : v.id,
    <number>mem + (n + 1) * 8,
    mem
  )

  const res = Array.from(
    idxs.slice(1).filter(idx => idx > 0),
    (idx, i) =>
      <[Variable | Constraint, number]>[
        idx <= m ? v.model.constrs[idx - 1] : v.model.vars[idx - 1 - m],
        coeffs[i + 1],
      ]
  )

  mod._free(mem)
  return res
}

export function evalTabColumn(v: Variable | Constraint): [Variable | Constraint, number][] {
  const m = v.model.numConstrs
  const mem = mod._malloc((m + 1) * (8 + 4))

  let coeffs = new Float64Array(mod.HEAPU8.buffer, <number>mem, m + 1)
  let idxs = new Int32Array(mod.HEAPU8.buffer, <number>mem + (m + 1) * 8, m + 1)

  mod._glp_eval_tab_col(
    v.model.ptr,
    v instanceof Variable ? m + v.id : v.id,
    <number>mem + (m + 1) * 8,
    mem
  )

  const res = Array.from(
    idxs.slice(1).filter(idx => idx > 0),
    (idx, i) =>
      <[Variable | Constraint, number]>[
        idx <= m ? v.model.constrs[idx - 1] : v.model.vars[idx - 1 - m],
        coeffs[i + 1],
      ]
  )

  mod._free(mem)
  return res
}
