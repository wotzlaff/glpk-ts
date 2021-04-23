import { Model } from './model'
import { mod } from './module'
import { getMessageLevel, MessageLevel } from './msglevel'
import { Const } from './enums'

export namespace Interior {
  export type OrderingAlgorithm = 'none' | 'qmd' | 'amd' | 'symamd'

  export interface Options {
    msgLevel?: MessageLevel
    ordering?: OrderingAlgorithm
  }

  export type ReturnCode = 'ok' | 'no_data' | 'no_convergence' | 'iteration_limit' | 'instability'

  function getOrderingAlgorithm(method: Interior.OrderingAlgorithm): Const.OrderingAlgorithm {
    const res = {
      none: Const.OrderingAlgorithm.NONE,
      qmd: Const.OrderingAlgorithm.QMD,
      amd: Const.OrderingAlgorithm.AMD,
      symamd: Const.OrderingAlgorithm.SYMAMD,
    }[method]
    if (res === undefined) throw new Error(`unknown ordering '${method}'`)
    return res
  }

  export function solve(model: Model, opts: Interior.Options): Interior.ReturnCode {
    const param = mod._malloc(392)
    mod._glp_init_iptcp(param)
    if (opts.msgLevel !== undefined) {
      mod.setValue(param, getMessageLevel(opts.msgLevel), 'i32')
    }
    if (opts.ordering !== undefined) {
      mod.setValue(<number>param + 4, getOrderingAlgorithm(opts.ordering), 'i32')
    }
    const ret = mod._glp_interior(model.ptr, param)
    mod._free(param)

    switch (ret) {
      case Const.ReturnCode.OK:
        return 'ok'
      case Const.ReturnCode.EFAIL:
        return 'no_data'
      case Const.ReturnCode.ENOCVG:
        return 'no_convergence'
      case Const.ReturnCode.EITLIM:
        return 'iteration_limit'
      case Const.ReturnCode.EINSTAB:
        return 'instability'
      default:
        throw new Error(`unknown return code from interior: ${ret}`)
    }
  }
}
