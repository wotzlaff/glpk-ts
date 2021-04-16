import { Model } from './model'
import { mod } from './module'
import { Const } from './enums'
import { getMessageLevel, MessageLevel } from './msglevel'

export namespace Simplex {
  export type Method = 'primal' | 'dual' | 'dual_primal'

  export interface Options {
    msgLevel?: MessageLevel
    method?: Method
  }

  export type ReturnCode =
    | 'ok'
    | 'basis_invalid'
    | 'basis_singular'
    | 'basis_ill_conditioned'
    | 'bounds_incorrect'
    | 'failure'
    | 'objective_lower'
    | 'objective_upper'
    | 'iteration_limit'
    | 'time_limit'
    | 'no_primal_feasible'
    | 'no_dual_feasible'

  function getMethod(method: Simplex.Method): Const.Method {
    const res = {
      primal: Const.Method.PRIMAL,
      dual: Const.Method.DUAL,
      dual_primal: Const.Method.DUAL_PRIMAL,
    }[method]
    if (res === undefined) throw new Error(`unknown method '${method}'`)
    return res
  }

  export function solve(model: Model, opts: Simplex.Options): ReturnCode {
    opts = opts || {}
    // write options struct
    const param = mod._malloc(352)
    mod._glp_init_smcp(param)
    if (opts.msgLevel !== undefined) {
      mod.setValue(param, getMessageLevel(opts.msgLevel), 'i32')
    }
    if (opts.method !== undefined) mod.setValue(<number>param + 4, getMethod(opts.method), 'i32')
    // start simplex method
    const ret = mod._glp_simplex(model.ptr, param)
    mod._free(param)
    switch (ret) {
      case 0:
        return 'ok'
      case Const.ReturnCode.EBADB:
        return 'basis_invalid'
      case Const.ReturnCode.ESING:
        return 'basis_singular'
      case Const.ReturnCode.ECOND:
        return 'basis_ill_conditioned'
      case Const.ReturnCode.EBOUND:
        return 'bounds_incorrect'
      case Const.ReturnCode.EFAIL:
        return 'failure'
      case Const.ReturnCode.EOBJLL:
        return 'objective_lower'
      case Const.ReturnCode.EOBJUL:
        return 'objective_upper'
      case Const.ReturnCode.EITLIM:
        return 'iteration_limit'
      case Const.ReturnCode.ETMLIM:
        return 'time_limit'
      case Const.ReturnCode.ENOPFS:
        return 'no_primal_feasible'
      case Const.ReturnCode.ENODFS:
        return 'no_dual_feasible'
      default:
        throw new Error(`unknown return code from simplex: ${ret}`)
    }
  }
}
