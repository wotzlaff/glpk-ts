import { Const } from './enums'

import { mod, ModelPtr } from './module'
import { Variable, VariableProperties } from './variable'
import { Constraint, ConstraintProperties } from './constraint'

import { getStatus, StatusSimplex, StatusInterior, StatusMIP } from './status'
import { Interior } from './interior'
import { Simplex } from './simplex'
import { MIP } from './mip'

export interface ModelProperties {
  name?: string
  sense?: 'min' | 'max'
}

interface VariableArray {
  [key: string]: Variable
}

interface VariablePropertiesArray {
  [key: string]: VariableProperties
}

export class Model {
  readonly ptr: ModelPtr
  private _vars: Variable[] = []
  private _constrs: Constraint[] = []

  get vars(): readonly Variable[] {
    return this._vars
  }

  get constrs(): readonly Constraint[] {
    return this._constrs
  }

  constructor(props?: ModelProperties) {
    if (mod === undefined) throw new Error('wasm module not loaded')
    this.ptr = mod._glp_create_prob()
    if (props === undefined) return
    const { name, sense } = props
    if (name !== undefined) {
      const maxLen = 4 * name.length + 1
      const namePtr = mod._malloc(maxLen)
      mod.stringToUTF8(name, namePtr, maxLen)
      mod._glp_set_prob_name(this.ptr, namePtr)
      mod._free(namePtr)
    }
    if (sense !== undefined) {
      this.sense = sense
    }
  }

  static fromPointer(ptr: ModelPtr): Model {
    const model = Object.create(Model.prototype)
    model.ptr = ptr
    return model
  }

  get value(): number {
    return mod._glp_get_obj_val(this.ptr)
  }

  get valueInt(): number {
    return mod._glp_ipt_obj_val(this.ptr)
  }

  get valueMIP(): number {
    return mod._glp_mip_obj_val(this.ptr)
  }

  get numVars(): number {
    return mod._glp_get_num_cols(this.ptr)
  }

  get numConstrs(): number {
    return mod._glp_get_num_rows(this.ptr)
  }

  get numNZs(): number {
    return mod._glp_get_num_nz(this.ptr)
  }

  get numBinary(): number {
    return mod._glp_get_num_bin(this.ptr)
  }

  get numInteger(): number {
    return mod._glp_get_num_int(this.ptr)
  }

  get status(): StatusSimplex {
    const stat = <Const.Status>mod._glp_get_status(this.ptr)
    return <StatusSimplex>getStatus(stat)
  }

  get statusPrimal(): StatusSimplex {
    const stat = <Const.Status>mod._glp_get_prim_stat(this.ptr)
    return <StatusSimplex>getStatus(stat)
  }

  get statusDual(): StatusSimplex {
    const stat = <Const.Status>mod._glp_get_dual_stat(this.ptr)
    return <StatusSimplex>getStatus(stat)
  }

  get statusInt(): StatusInterior {
    const stat = <Const.Status>mod._glp_ipt_status(this.ptr)
    return <StatusInterior>getStatus(stat)
  }

  get statusMIP(): StatusMIP {
    const stat = <Const.Status>mod._glp_mip_status(this.ptr)
    return <StatusMIP>getStatus(stat)
  }

  addVars(vars: number, props?: VariableProperties): Variable[]
  addVars(vars: VariableProperties[]): Variable[]
  addVars(vars: VariablePropertiesArray): VariableArray

  addVars(
    vars: number | VariableProperties[] | VariablePropertiesArray,
    props?: VariableProperties
  ): Variable[] | VariableArray {
    if (Number.isInteger(vars)) {
      return this.addVarsByCount(<number>vars, props)
    } else if (Array.isArray(vars)) {
      return this.addVarsByProperties(<VariableProperties[]>vars)
    } else {
      return this.addVarsFromPropertiesArray(<VariablePropertiesArray>vars)
    }
  }

  addVar(props?: VariableProperties): Variable {
    const idx0 = mod._glp_add_cols(this.ptr, 1)
    const v = new Variable(this, idx0, props)
    this._vars.push(v)
    return v
  }

  private addVarsByProperties(props: VariableProperties[]): Variable[] {
    const idx0 = mod._glp_add_cols(this.ptr, props.length)
    const vars = props.map((v, offset) => new Variable(this, idx0 + offset, v))
    this._vars = this._vars.concat(vars)
    return vars
  }

  private addVarsByCount(n: number, props?: VariableProperties): Variable[] {
    const idx0 = mod._glp_add_cols(this.ptr, n)
    const vars = Array.from(
      Array(n).keys(),
      offset =>
        new Variable(
          this,
          idx0 + offset,
          props && props.name
            ? { ...props, name: `${props.name}_${offset}` }
            : props
        )
    )
    this._vars = this._vars.concat(vars)
    return vars
  }

  private addVarsFromPropertiesArray(
    props: VariablePropertiesArray
  ): VariableArray {
    const n = Object.keys(props).length
    const idx0 = mod._glp_add_cols(this.ptr, n)
    const vars = Object.fromEntries(
      Object.entries(props).map(([key, prop], offset) => [
        key,
        new Variable(
          this,
          idx0 + offset,
          prop.name
            ? Object.assign({}, prop, { name: `${prop.name}[${key}]` })
            : prop
        ),
      ])
    )
    this._vars = this._vars.concat(Object.values(vars))
    return vars
  }

  addConstrs(constrs: number): Constraint[]
  addConstrs(constrs: ConstraintProperties[]): Constraint[]

  addConstrs(
    constrs: number | ConstraintProperties[],
    props?: ConstraintProperties
  ): Constraint[] {
    if (Number.isInteger(constrs)) {
      return this.addConstrsByCount(<number>constrs, props)
    } else {
      return this.addConstrsByProperties(<ConstraintProperties[]>constrs)
    }
  }

  addConstr(props?: ConstraintProperties): Constraint {
    const idx0 = mod._glp_add_rows(this.ptr, 1)
    const c = new Constraint(this, idx0, props)
    this._constrs.push(c)
    return c
  }

  private addConstrsByProperties(props: ConstraintProperties[]): Constraint[] {
    const idx0 = mod._glp_add_rows(this.ptr, props.length)
    const constrs = props.map(
      (v, offset) => new Constraint(this, idx0 + offset, v)
    )
    this._constrs = this._constrs.concat(constrs)
    return constrs
  }

  private addConstrsByCount(
    n: number,
    props?: ConstraintProperties
  ): Constraint[] {
    const idx0 = mod._glp_add_rows(this.ptr, n)
    const constrs = Array.from(
      Array(n).keys(),
      offset =>
        new Constraint(
          this,
          idx0 + offset,
          props && props.name
            ? { ...props, name: `${props.name}_${offset}` }
            : props
        )
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
    return mod._glp_get_obj_dir(this.ptr) === Const.ObjectiveDirection.MIN
      ? 'min'
      : 'max'
  }

  set sense(sense: 'min' | 'max') {
    if (sense !== 'min' && sense !== 'max')
      throw new Error(`unknown sense '${sense}'`)
    mod._glp_set_obj_dir(
      this.ptr,
      sense === 'min'
        ? Const.ObjectiveDirection.MIN
        : Const.ObjectiveDirection.MAX
    )
  }

  toModelLP(): string {
    this.update()
    const fname = '_tmp.lp'
    const fnamePtr = mod._malloc(fname.length + 1)
    mod.stringToUTF8(fname, fnamePtr, fname.length + 1)
    mod._glp_write_lp(this.ptr, 0, fnamePtr)
    mod._free(fnamePtr)
    return mod.FS.readFile(fname, { encoding: 'utf8' })
  }

  simplex(opts?: Simplex.Options): Simplex.ReturnCode {
    this.update()
    return Simplex.solve(this, opts || {})
  }

  interior(opts?: Interior.Options): Interior.ReturnCode {
    this.update()
    return Interior.solve(this, opts || {})
  }

  intopt(opts?: MIP.Options): MIP.ReturnCode {
    this.update()
    return MIP.solve(this, opts || {})
  }

  get solution(): string {
    switch (this.status) {
      case 'undefined':
      case 'infeasible':
        throw new Error(`status is '${this.status}', run simplex first`)
      case 'feasible':
      case 'optimal':
        return [
          `status = ${this.status}`,
          ...this._vars.map(v => `${v.name} = ${v.value}`),
          `value = ${this.value}`,
        ].join('\n')
      case 'unbounded':
        return 'problem is unbounded'
      case 'no_feasible':
        return 'problem has no feasible solution'
      default:
        throw new Error('unknown status')
    }
  }

  get solutionInt(): string {
    switch (this.statusInt) {
      case 'undefined':
      case 'infeasible':
        throw new Error(`status is '${this.statusInt}', run simplex first`)
      case 'optimal':
        return [
          `status = ${this.status}`,
          ...this._vars.map(v => `${v.name} = ${v.valueInt}`),
          `value = ${this.valueInt}`,
        ].join('\n')
      case 'no_feasible':
        return 'problem has no feasible solution'
      default:
        throw new Error('unknown status')
    }
  }

  get solutionMIP(): string {
    switch (this.statusMIP) {
      case 'undefined':
        throw new Error(`status is '${this.statusInt}', run simplex first`)
      case 'feasible':
      case 'optimal':
        return [
          `status = ${this.status}`,
          ...this._vars.map(v => `${v.name} = ${v.valueMIP}`),
          `value = ${this.valueMIP}`,
        ].join('\n')
      case 'no_feasible':
        return 'problem has no feasible solution'
      default:
        throw new Error('unknown status')
    }
  }

  get ray(): Variable | Constraint {
    const k = mod._glp_get_unbnd_ray(this.ptr)
    if (k === 0) throw new Error('no unbounded ray')
    if (k <= this.numConstrs) {
      return this._constrs[k - 1]
    } else {
      return this._vars[k - 1 - this.numConstrs]
    }
  }

  getTableau(formatNumber?: (v: number) => string): string {
    const format =
      formatNumber === undefined
        ? (formatNumber = v => v.toString())
        : formatNumber
    return [
      ...[...this.vars, ...this.constrs]
        .filter(v => v.status === 'basic')
        .map(
          v =>
            v.name +
            ' = ' +
            [
              ...v.row.map(
                ([u, val]) =>
                  `${format(u instanceof Variable ? val : -val)} ${u.name}`
              ),
              format(v.value),
            ].join(' + ')
        ),
      'z = ' +
        [
          ...[...this.vars, ...this.constrs]
            .filter(v => v.status !== 'basic')
            .map(
              v =>
                `${format(v instanceof Variable ? v.dual : -v.dual)} ${v.name}`
            ),
          format(this.value),
        ].join(' + '),
    ].join('\n')
  }
}
