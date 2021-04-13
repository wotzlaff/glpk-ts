import { mod, RawModel } from './module'
import { getBoundType } from './bounds'
import { RawVariableType } from './enums'

export type VariableType = 'c' | 'b' | 'i'

function getVariableType(type?: VariableType): RawVariableType {
  if (type === undefined || type === 'c') return RawVariableType.CONTINUOUS
  if (type === 'i') return RawVariableType.INTEGER
  if (type === 'b') return RawVariableType.BINARY
  throw new Error(`unknown variable type '${type}'`)
}

export interface VariableProperties {
  obj?: number
  lb?: number
  ub?: number
  type?: VariableType
}

export class Variable {
  _model: RawModel
  _idx: number
  _lb: number | undefined = 0.0
  _ub: number | undefined = 0.0

  constructor(model: RawModel, idx: number, props?: VariableProperties) {
    this._model = model
    this._idx = idx

    if (props === undefined) return
    const { obj, lb, ub, type } = props
    if (obj !== undefined) this.obj = obj
    this.setBounds(lb, ub)
    if (type !== undefined) this.type = getVariableType(type)
  }

  private setBounds(lb?: number, ub?: number) {
    if (lb === this._lb && ub === this._ub) return
    this._lb = lb
    this._ub = ub
    const boundType = getBoundType(lb, ub)
    mod._glp_set_col_bnds(this._model, this._idx, boundType, lb || 0.0, ub || 0.0)
  }

  set bounds([lb, ub]: [number | undefined, number | undefined]) {
    this.setBounds(lb, ub)
  }

  set lb(lb: number | undefined) {
    this.setBounds(lb, this.ub)
  }

  set ub(ub: number | undefined) {
    this.setBounds(this.lb, ub)
  }

  get lb(): number | undefined {
    return this._lb
    // return mod._glp_get_col_lb(this._model, this._idx)
  }

  get ub(): number | undefined {
    return this._ub
    // return mod._glp_get_col_ub(this._model, this._idx)
  }

  get obj(): number {
    return mod._glp_get_obj_coef(this._model, this._idx)
  }

  set obj(obj: number) {
    if (typeof obj !== 'number') throw new Error('obj should be a number')
    mod._glp_set_obj_coef(this._model, this._idx, obj)
  }

  set type(type: RawVariableType) {
    mod._glp_set_col_kind(this._model, this._idx, type)
  }

  get value(): number {
    return mod._glp_get_col_prim(this._model, this._idx)
  }

  get dual(): number {
    return mod._glp_get_col_dual(this._model, this._idx)
  }
}

export default Variable
