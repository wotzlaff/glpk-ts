import { Model } from './model'
import { mod } from './module'
import { Const } from './enums'
import { getMessageLevel, MessageLevel } from './msglevel'

export namespace Simplex {
  export interface Options {
    msgLevel?: MessageLevel
    method?: 'primal' | 'dual' | 'dual_primal'
    pricing?: 'std' | 'pse'
    ratioTest?: 'std' | 'harris' | 'flipflop'
    tolPrimal?: number
    tolDual?: number
    tolPivot?: number
    objLower?: number
    objUpper?: number
    limitIter?: number
    limitTime?: number
    logFreq?: number
    logDelay?: number
    presolve?: boolean
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

  function getMethod(method: string): Const.Method {
    const res = {
      primal: Const.Method.PRIMAL,
      dual: Const.Method.DUAL,
      dual_primal: Const.Method.DUALP,
    }[method]
    if (res === undefined) throw new Error(`unknown method '${method}'`)
    return res
  }

  function getPricing(pricing: string): Const.Pricing {
    const res = {
      std: Const.Pricing.STD,
      pse: Const.Pricing.PSE,
    }[pricing]
    if (res === undefined) throw new Error(`unknown pricing '${pricing}'`)
    return res
  }

  function getRatioTest(rtest: string): Const.RatioTest {
    const res = {
      std: Const.RatioTest.STD,
      harris: Const.RatioTest.HAR,
      flipflop: Const.RatioTest.FLIP,
    }[rtest]
    if (res === undefined) throw new Error(`unknown ratioTest '${rtest}'`)
    return res
  }

  function getReturnCode(retCode: number): ReturnCode {
    switch (retCode) {
      case Const.ReturnCode.OK:
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
        throw new Error(`unknown return code from simplex: ${retCode}`)
    }
  }

  function createStruct(opts: Options) {
    const param = mod._malloc(352)
    mod._glp_init_smcp(param)
    if (opts.msgLevel !== undefined) {
      mod.setValue(param, getMessageLevel(opts.msgLevel), 'i32')
    }
    if (opts.method !== undefined) {
      mod.setValue(<number>param + 4, getMethod(opts.method), 'i32')
    }
    if (opts.pricing !== undefined) {
      mod.setValue(<number>param + 8, getPricing(opts.pricing), 'i32')
    }
    if (opts.ratioTest !== undefined) {
      mod.setValue(<number>param + 12, getRatioTest(opts.ratioTest), 'i32')
    }
    if (opts.tolPrimal !== undefined) {
      mod.setValue(<number>param + 16, opts.tolPrimal, 'double')
    }
    if (opts.tolDual !== undefined) {
      mod.setValue(<number>param + 24, opts.tolDual, 'double')
    }
    if (opts.tolPivot !== undefined) {
      mod.setValue(<number>param + 32, opts.tolPivot, 'double')
    }
    if (opts.objLower !== undefined) {
      mod.setValue(<number>param + 40, opts.objLower, 'double')
    }
    if (opts.objUpper !== undefined) {
      mod.setValue(<number>param + 48, opts.objUpper, 'double')
    }
    if (opts.limitIter !== undefined) {
      mod.setValue(<number>param + 56, opts.limitIter, 'i32')
    }
    if (opts.limitTime !== undefined) {
      mod.setValue(<number>param + 60, opts.limitTime, 'i32')
    }
    if (opts.logFreq !== undefined) {
      mod.setValue(<number>param + 64, opts.logFreq, 'i32')
    }
    if (opts.logDelay !== undefined) {
      mod.setValue(<number>param + 68, opts.logDelay, 'i32')
    }
    if (opts.presolve !== undefined) {
      mod.setValue(<number>param + 72, opts.presolve ? 1 : 0, 'i32')
    }
    return param
  }

  export function solve(model: Model, opts: Options): ReturnCode {
    // write options struct
    const param = createStruct(opts || {})
    // start simplex method
    const retCode = mod._glp_simplex(model.ptr, param)
    mod._free(param)
    return getReturnCode(retCode)
  }

  export function solveExact(model: Model, opts: Options): ReturnCode {
    // write options struct
    const param = createStruct(opts || {})
    // start simplex method
    const retCode = mod._glp_exact(model.ptr, param)
    mod._free(param)
    return getReturnCode(retCode)
  }
}
