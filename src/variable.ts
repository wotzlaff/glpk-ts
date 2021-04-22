import { mod, ModelPtr } from './module'
import { Model } from './model'
import { getBoundType } from './bounds'
import { Const } from './enums'

export type VariableType =
  | 'c'
  | 'b'
  | 'i'
  | 'cont'
  | 'continuous'
  | 'bin'
  | 'binary'
  | 'int'
  | 'integer'

const VARIABLETYPE2RAW = new Map<VariableType | undefined, Const.VariableType>([
  [undefined, Const.VariableType.CONTINUOUS],
  ['c', Const.VariableType.CONTINUOUS],
  ['cont', Const.VariableType.CONTINUOUS],
  ['continuous', Const.VariableType.CONTINUOUS],
  ['i', Const.VariableType.INTEGER],
  ['int', Const.VariableType.INTEGER],
  ['integer', Const.VariableType.INTEGER],
  ['b', Const.VariableType.BINARY],
  ['bin', Const.VariableType.BINARY],
  ['binary', Const.VariableType.BINARY],
])

const RAW2VARIABLETYPE = new Map(
  Array.from(VARIABLETYPE2RAW.entries(), ([k, v]) => [v, k])
)

function getVariableType(type?: VariableType): Const.VariableType {
  const res = VARIABLETYPE2RAW.get(type)
  if (res === undefined) throw new Error(`unknown variable type '${type}'`)
  return res
}

export type VariableStatus =
  | 'basic'
  | 'lower-bound'
  | 'upper-bound'
  | 'free'
  | 'fixed'

export const VARIABLESTATUS2RAW = new Map<VariableStatus, Const.VariableStatus>(
  [
    ['basic', Const.VariableStatus.BASIC],
    ['lower-bound', Const.VariableStatus.LB],
    ['upper-bound', Const.VariableStatus.UB],
    ['free', Const.VariableStatus.FREE],
    ['fixed', Const.VariableStatus.FIXED],
  ]
)

export const RAW2VARIABLESTATUS = new Map(
  Array.from(VARIABLESTATUS2RAW.entries(), ([k, v]) => [v, k])
)

export interface VariableProperties {
  obj?: number
  lb?: number
  ub?: number
  type?: VariableType
  name?: string
}

export class Variable {
  model: Model
  _idx: number
  _lb: number | undefined = 0.0
  _ub: number | undefined = 0.0

  private get ptr(): ModelPtr {
    return this.model.ptr
  }

  constructor(model: Model, idx: number, props?: VariableProperties) {
    this.model = model
    this._idx = idx

    if (props === undefined) return
    const { obj, lb, ub, type, name } = props
    if (obj !== undefined) this.obj = obj
    this.setBounds(lb, ub)
    if (type !== undefined) this.type = type
    if (name !== undefined) this.name = name
  }

  private setBounds(lb?: number, ub?: number) {
    if (lb === this._lb && ub === this._ub) return
    this._lb = lb
    this._ub = ub
    const boundType = getBoundType(lb, ub)
    mod._glp_set_col_bnds(this.ptr, this._idx, boundType, lb || 0.0, ub || 0.0)
  }

  set bounds([lb, ub]: [number | undefined, number | undefined]) {
    this.setBounds(lb, ub)
  }

  set name(name: string) {
    const strLen = mod.lengthBytesUTF8(name) + 1
    const namePtr = mod._malloc(strLen)
    mod.stringToUTF8(name, namePtr, strLen)
    mod._glp_set_col_name(this.ptr, this._idx, namePtr)
    mod._free(namePtr)
  }

  get name(): string {
    const namePtr = mod._glp_get_col_name(this.ptr, this._idx)
    return mod.UTF8ToString(namePtr)
  }

  set lb(lb: number | undefined) {
    this.setBounds(lb, this.ub)
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

  get obj(): number {
    return mod._glp_get_obj_coef(this.ptr, this._idx)
  }

  set obj(obj: number) {
    if (typeof obj !== 'number') throw new Error('obj should be a number')
    mod._glp_set_obj_coef(this.ptr, this._idx, obj)
  }

  set type(type: VariableType) {
    mod._glp_set_col_kind(this.ptr, this._idx, getVariableType(type))
  }

  get type(): VariableType {
    return <VariableType>(
      RAW2VARIABLETYPE.get(mod._glp_get_col_kind(this.ptr, this._idx))
    )
  }

  get value(): number {
    return mod._glp_get_col_prim(this.ptr, this._idx)
  }

  get dual(): number {
    return mod._glp_get_col_dual(this.ptr, this._idx)
  }

  get valueInt(): number {
    return mod._glp_ipt_col_prim(this.ptr, this._idx)
  }

  get dualInt(): number {
    return mod._glp_ipt_col_dual(this.ptr, this._idx)
  }

  get valueMIP(): number {
    return mod._glp_mip_col_val(this.ptr, this._idx)
  }

  get status(): VariableStatus {
    return <VariableStatus>(
      RAW2VARIABLESTATUS.get(mod._glp_get_col_stat(this.ptr, this._idx))
    )
  }
}
