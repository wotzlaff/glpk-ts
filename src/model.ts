import { RawObjectiveDirection, RawMessageLevel, RawMethod } from './enums'

import { loadModule, mod, RawModel } from './module'
import Variable, { VariableProperties } from './variable'
import Constraint, { ConstraintProperties } from './constraint'
import { SMCPPtr } from 'glpk-wasm'

export namespace Simplex {
  export type Method = 'primal' | 'dual' | 'dual_primal'
  export type MessageLevel = 'all' | 'on' | 'off' | 'error' | 'debug'

  export interface Options {
    msgLevel?: MessageLevel
    method?: Method
  }
}
export class Simplex {
  static getMessageLevel(msgLevel: Simplex.MessageLevel): RawMessageLevel {
    const res = {
      all: RawMessageLevel.ALL,
      on: RawMessageLevel.ON,
      off: RawMessageLevel.OFF,
      debug: RawMessageLevel.DEBUG,
      error: RawMessageLevel.ERROR,
    }[msgLevel]
    if (res === undefined) throw new Error(`unknown message level '${msgLevel}'`)
    return res
  }

  static getMethod(method: Simplex.Method): RawMethod {
    const res = {
      primal: RawMethod.PRIMAL,
      dual: RawMethod.DUAL,
      dual_primal: RawMethod.DUAL_PRIMAL,
    }[method]
    if (res === undefined) throw new Error(`unknown method '${method}'`)
    return res
  }

  static toStruct(opts: Simplex.Options) {
    const param = mod._malloc(352)
    mod._glp_init_smcp(param)
    if (opts.msgLevel !== undefined)
      mod.setValue(param, Simplex.getMessageLevel(opts.msgLevel), 'i32')
    if (opts.method !== undefined)
      mod.setValue(<number>param + 4, Simplex.getMethod(opts.method), 'i32')
    return param
  }
}

export interface ModelProperties {
  name?: string
  sense?: 'min' | 'max'
}

export class Model {
  private _model: RawModel = mod._glp_create_prob()
  private _vars: Variable[] = []
  private _constrs: Constraint[] = []

  constructor(props?: ModelProperties) {
    if (mod === undefined) throw new Error('wasm module not loaded')
    if (props === undefined) return
    const { name, sense } = props
    if (name !== undefined) {
      const maxLen = 4 * name.length + 1
      const namePtr = mod._malloc(maxLen)
      mod.stringToUTF8(name, namePtr, maxLen)
      mod._glp_set_prob_name(this._model, namePtr)
      mod._free(namePtr)
    }
    if (sense !== undefined) {
      this.sense = sense
    }
  }

  get numVars(): number {
    return mod._glp_get_num_cols(this._model)
  }

  get numConstrs(): number {
    return mod._glp_get_num_rows(this._model)
  }

  addVars(vars: number, props?: VariableProperties): Variable[]
  addVars(vars: VariableProperties[]): Variable[]

  addVars(vars: number | VariableProperties[], props?: VariableProperties): Variable[] {
    if (Number.isInteger(vars)) {
      return this.addVarsByCount(<number>vars, props)
    } else {
      return this.addVarsByProperties(<VariableProperties[]>vars)
    }
  }

  addVar(props?: VariableProperties): Variable {
    const idx0 = mod._glp_add_cols(this._model, 1)
    const v = new Variable(this._model, idx0, props)
    this._vars.push(v)
    return v
  }

  private addVarsByProperties(props: VariableProperties[]): Variable[] {
    const idx0 = mod._glp_add_cols(this._model, props.length)
    const vars = props.map((v, offset) => new Variable(this._model, idx0 + offset, v))
    this._vars = this._vars.concat(vars)
    return vars
  }

  private addVarsByCount(n: number, props?: VariableProperties): Variable[] {
    const idx0 = mod._glp_add_cols(this._model, n)
    const vars = Array.from(
      Array(n).keys(),
      offset => new Variable(this._model, idx0 + offset, props)
    )
    this._vars = this._vars.concat(vars)
    return vars
  }

  addConstrs(constrs: number): Constraint[]
  addConstrs(constrs: ConstraintProperties[]): Constraint[]

  addConstrs(constrs: number | ConstraintProperties[], props?: ConstraintProperties): Constraint[] {
    if (Number.isInteger(constrs)) {
      return this.addConstrsByCount(<number>constrs, props)
    } else {
      return this.addConstrsByProperties(<ConstraintProperties[]>constrs)
    }
  }

  addConstr(props?: ConstraintProperties): Constraint {
    const idx0 = mod._glp_add_rows(this._model, 1)
    const c = new Constraint(this._model, idx0, props)
    this._constrs.push(c)
    return c
  }

  private addConstrsByProperties(props: ConstraintProperties[]): Constraint[] {
    const idx0 = mod._glp_add_rows(this._model, props.length)
    const constrs = props.map((v, offset) => new Constraint(this._model, idx0 + offset, v))
    this._constrs = this._constrs.concat(constrs)
    return constrs
  }

  private addConstrsByCount(n: number, props?: ConstraintProperties): Constraint[] {
    const idx0 = mod._glp_add_rows(this._model, n)
    const constrs = Array.from(
      Array(n).keys(),
      offset => new Constraint(this._model, idx0 + offset, props)
    )
    this._constrs = this._constrs.concat(constrs)
    return constrs
  }

  update(): void {
    for (const c of this._constrs) {
      c.update()
    }
  }

  get sense(): 'min' | 'max' {
    return mod._glp_get_obj_dir(this._model) === RawObjectiveDirection.MIN ? 'min' : 'max'
  }

  set sense(sense: 'min' | 'max') {
    if (sense !== 'min' && sense !== 'max') throw new Error(`unknown sense '${sense}'`)
    mod._glp_set_obj_dir(
      this._model,
      sense === 'min' ? RawObjectiveDirection.MIN : RawObjectiveDirection.MAX
    )
  }

  toModelLP(): string {
    this.update()
    const fname = '_tmp.lp'
    const fnamePtr = mod._malloc(fname.length + 1)
    mod.stringToUTF8(fname, fnamePtr, fname.length + 1)
    mod._glp_write_lp(this._model, 0, fnamePtr)
    mod._free(fnamePtr)
    return mod.FS.readFile(fname, { encoding: 'utf8' })
  }

  simplex(opts?: Simplex.Options): void {
    this.update()
    const param = opts === undefined ? undefined : Simplex.toStruct(opts)
    mod._glp_simplex(this._model, <SMCPPtr>param)
    if (param !== undefined) mod._free(param)
  }
}

export async function createModel(props?: ModelProperties) {
  await loadModule()
  return new Model(props)
}

export default Model
