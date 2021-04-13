import { mod, RawModel } from './module'
import { getBoundType } from './bounds'
import Variable from './variable'

export type CoefficientList = Array<[Variable, number]> | Map<Variable, number>

export interface ConstraintProperties {
  lb?: number
  ub?: number
  coeffs?: CoefficientList
}

export class Constraint {
  private _needsUpdate = false

  private _model: RawModel
  private _idx: number
  private _lb?: number = 0.0
  private _ub?: number = undefined
  private _coeffs: Map<number, number>

  constructor(model: Ptr, idx: number, props?: ConstraintProperties) {
    this._model = model
    this._idx = idx
    this._coeffs = new Map()
    if (!props) return
    this.setBounds(props.lb, props.ub)
    if (props.coeffs !== undefined) this.addCollection(props.coeffs)
  }

  get id() {
    return this._idx
  }

  setBounds(lb?: number, ub?: number) {
    if (lb === this._lb && ub === this._ub) return
    const boundType = getBoundType(lb, ub)
    this._lb = lb
    this._ub = ub
    mod._glp_set_row_bnds(this._model, this._idx, boundType, lb || 0.0, ub || 0.0)
  }

  set bounds([lb, ub]: [number | undefined, number | undefined]) {
    this.setBounds(lb, ub)
  }

  set lb(lb: number | undefined) {
    this.setBounds(lb, this._ub)
  }

  set ub(ub: number | undefined) {
    this.setBounds(this.lb, ub)
  }

  add(v: CoefficientList): Constraint
  add(v: Variable, c: number): Constraint

  add(v: any, c?: any): Constraint {
    if (c === undefined) {
      return this.addCollection(v)
    }
    if (!(v instanceof Variable)) {
      throw new Error('variable should habe type Variable')
    }
    if (!c) return this
    const value = (this._coeffs.get(v._idx) || 0) + c
    if (!value) {
      this._coeffs.delete(v._idx)
    } else {
      this._coeffs.set(v._idx, value)
    }
    this._needsUpdate = true
    return this
  }

  private addCollection(coeffs: CoefficientList): Constraint {
    const iter =
      coeffs instanceof Array ? coeffs : coeffs instanceof Map ? coeffs.entries() : undefined
    if (iter === undefined) {
      throw new Error('coeffs should have type Array or Map')
    }
    for (const [v, c] of iter) {
      if (!(v instanceof Variable)) {
        throw new Error('variable should habe type Variable')
      }
      if (!c) continue
      const value = (this._coeffs.get(v._idx) || 0) + c
      if (!value) {
        this._coeffs.delete(v._idx)
      } else {
        this._coeffs.set(v._idx, value)
      }
      this._needsUpdate = true
    }
    return this
  }

  update() {
    if (!this._needsUpdate) return this
    const size = this._coeffs.size + 1
    const memIdx = mod._malloc(size * 4)
    const memCoeff = mod._malloc(size * 8)
    let idx = new Int32Array(mod.HEAPU8.buffer, <number>memIdx, size)
    let coeff = new Float64Array(mod.HEAPU8.buffer, <number>memCoeff, size)
    idx[0] = 0
    coeff[0] = 0.0

    let i = 0
    for (const [v, c] of this._coeffs.entries()) {
      i++
      idx[i] = v
      coeff[i] = c
    }
    mod._glp_set_mat_row(this._model, this._idx, size - 1, memIdx, memCoeff)

    mod._free(memIdx)
    mod._free(memCoeff)
    this._needsUpdate = false
    return this
  }

  get value(): number {
    return mod._glp_get_row_prim(this._model, this._idx)
  }

  get dual(): number {
    return mod._glp_get_row_dual(this._model, this._idx)
  }
}
export default Constraint
