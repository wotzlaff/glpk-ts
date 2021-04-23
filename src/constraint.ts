import { mod, ModelPtr } from './module'
import { Model } from './model'
import { getBoundType } from './bounds'
import { Variable, VariableStatus, RAW2VARIABLESTATUS } from './variable'
import { evalTabRow, evalTabColumn } from './eval-tab'

export type CoefficientList = Array<[Variable, number]> | Map<Variable, number>

export interface ConstraintProperties {
  lb?: number
  ub?: number
  coeffs?: CoefficientList
  name?: string
}

export class Constraint {
  private _needsUpdate = false

  readonly model: Model
  private _idx: number
  private _lb?: number = 0.0
  private _ub?: number = 0.0
  private _coeffs: Map<number, number>

  private get ptr(): ModelPtr {
    return this.model.ptr
  }

  constructor(model: Model, idx: number, props?: ConstraintProperties) {
    this.model = model
    this._idx = idx
    this._coeffs = new Map()
    if (!props) return
    const { lb, ub, coeffs, name } = props
    this.setBounds(lb, ub)
    if (coeffs !== undefined) this.addCollection(coeffs)
    if (name !== undefined) this.name = name
  }

  get id() {
    return this._idx
  }

  set name(name: string) {
    const strLen = mod.lengthBytesUTF8(name) + 1
    const namePtr = mod._malloc(strLen)
    mod.stringToUTF8(name, namePtr, strLen)
    mod._glp_set_row_name(this.ptr, this._idx, namePtr)
    mod._free(namePtr)
  }

  get name(): string {
    const namePtr = mod._glp_get_row_name(this.ptr, this._idx)
    return mod.UTF8ToString(namePtr)
  }

  setBounds(lb?: number, ub?: number) {
    if (lb === this._lb && ub === this._ub) return
    const boundType = getBoundType(lb, ub)
    this._lb = lb
    this._ub = ub
    mod._glp_set_row_bnds(this.ptr, this._idx, boundType, lb || 0.0, ub || 0.0)
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

  get lb(): number | undefined {
    return this._lb
  }

  get ub(): number | undefined {
    return this._ub
  }

  add(v: CoefficientList): Constraint
  add(v: Variable, c: number): Constraint

  add(v: any, c?: any): Constraint {
    if (c === undefined) {
      return this.addCollection(v)
    }
    if (!(v instanceof Variable)) {
      throw new Error('variable should have type Variable')
    }
    if (!c) return this
    const value = (this._coeffs.get(v.id) || 0) + c
    if (!value) {
      this._coeffs.delete(v.id)
    } else {
      this._coeffs.set(v.id, value)
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
        throw new Error('variable should have type Variable')
      }
      if (!c) continue
      const value = (this._coeffs.get(v.id) || 0) + c
      if (!value) {
        this._coeffs.delete(v.id)
      } else {
        this._coeffs.set(v.id, value)
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
    mod._glp_set_mat_row(this.ptr, this._idx, size - 1, memIdx, memCoeff)

    mod._free(memIdx)
    mod._free(memCoeff)
    this._needsUpdate = false
    return this
  }

  get value(): number {
    return mod._glp_get_row_prim(this.ptr, this._idx)
  }

  get dual(): number {
    return mod._glp_get_row_dual(this.ptr, this._idx)
  }

  get valueInt(): number {
    return mod._glp_ipt_row_prim(this.ptr, this._idx)
  }

  get dualInt(): number {
    return mod._glp_ipt_row_dual(this.ptr, this._idx)
  }

  get valueMIP(): number {
    return mod._glp_mip_row_val(this.ptr, this._idx)
  }

  get status(): VariableStatus {
    return <VariableStatus>RAW2VARIABLESTATUS.get(mod._glp_get_row_stat(this.ptr, this._idx))
  }

  get row(): [Variable | Constraint, number][] {
    return evalTabRow(this)
  }

  get column(): [Variable | Constraint, number][] {
    return evalTabColumn(this)
  }
}
