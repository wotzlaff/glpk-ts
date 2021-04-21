import { Model } from './model'
import { mod } from './module'
import { Const } from './enums'
import { getMessageLevel, MessageLevel } from './msglevel'
import Tree from './tree'
import { IOCPPtr, TreePtr } from 'glpk-wasm'

export namespace MIP {
  const BranchingTechniques = {
    ffv: Const.BranchingTechnique.FFV,
    lfv: Const.BranchingTechnique.LFV,
    mfv: Const.BranchingTechnique.MFV,
    dth: Const.BranchingTechnique.DTH,
    pch: Const.BranchingTechnique.PCH,
    first_fractional: Const.BranchingTechnique.FFV,
    last_fractional: Const.BranchingTechnique.LFV,
    most_fractional: Const.BranchingTechnique.MFV,
    driebeck_tomlin: Const.BranchingTechnique.DTH,
    hybrid_pseudocost: Const.BranchingTechnique.PCH,
  }
  type BranchingTechnique = keyof typeof BranchingTechniques

  const BacktrackingTechniques = {
    dfs: Const.BacktrackingTechnique.DFS,
    bfs: Const.BacktrackingTechnique.BFS,
    blb: Const.BacktrackingTechnique.BLB,
    bph: Const.BacktrackingTechnique.BPH,
    depth_first: Const.BacktrackingTechnique.DFS,
    breadth_first: Const.BacktrackingTechnique.BFS,
    best_bound: Const.BacktrackingTechnique.BLB,
    best_projection: Const.BacktrackingTechnique.BPH,
  }
  type BacktrackingTechnique = keyof typeof BacktrackingTechniques

  const PreprocessingTechniques = {
    none: Const.PreprocessingTechnique.NONE,
    root: Const.PreprocessingTechnique.ROOT,
    all: Const.PreprocessingTechnique.ALL,
  }
  type PreprocessingTechnique = keyof typeof PreprocessingTechniques

  export interface Options {
    msgLevel?: MessageLevel
    branching?: BranchingTechnique
    backtracking?: BacktrackingTechnique
    tolInt?: number
    tolObj?: number
    limitTime?: number
    logFreq?: number
    logDelay?: number
    callback?: (tree: Tree) => void
    callbackPtr?: FunctionPtr
    preprocessing?: PreprocessingTechnique
    gapMIP?: number
    cutsMIR?: boolean
    cutsGomory?: boolean
    cutsCover?: boolean
    cutsClique?: boolean
    presolve?: boolean
    binarize?: boolean
    heuristicFP?: boolean
    heuristicPS?: boolean
    limitProxy?: number
    heuristicRound?: boolean
  }

  export type ReturnCode =
    | 'ok'
    | 'bounds_incorrect'
    | 'no_root_basis'
    | 'no_primal_feasible'
    | 'no_dual_feasible'
    | 'failure'
    | 'mip_gap_tolerance'
    | 'time_limit'
    | 'stopped'

  function getReturnCode(retCode: number): ReturnCode {
    switch (retCode) {
      case Const.ReturnCode.OK:
        return 'ok'
      case Const.ReturnCode.EBOUND:
        return 'bounds_incorrect'
      case Const.ReturnCode.EROOT:
        return 'no_root_basis'
      case Const.ReturnCode.ENOPFS:
        return 'no_primal_feasible'
      case Const.ReturnCode.ENODFS:
        return 'no_dual_feasible'
      case Const.ReturnCode.EFAIL:
        return 'failure'
      case Const.ReturnCode.EMIPGAP:
        return 'mip_gap_tolerance'
      case Const.ReturnCode.ETMLIM:
        return 'time_limit'
      case Const.ReturnCode.ESTOP:
        return 'stopped'

      default:
        throw new Error(`unknown return code from intopt: ${retCode}`)
    }
  }

  function createStruct(opts: Options) {
    const param = <IOCPPtr>mod._malloc(328)
    mod._glp_init_iocp(param)
    let tmp
    opts.msgLevel !== undefined && mod.setValue(param, getMessageLevel(opts.msgLevel), 'i32')
    if (opts.branching !== undefined) {
      tmp = BranchingTechniques[opts.branching]
      if (tmp === undefined) throw new Error(`unknown branching technique '${opts.branching}'`)
      mod.setValue(<number>param + 4, tmp, 'i32')
    }
    if (opts.backtracking !== undefined) {
      tmp = BacktrackingTechniques[opts.backtracking]
      if (tmp === undefined)
        throw new Error(`unknown backtracking technique '${opts.backtracking}'`)
      mod.setValue(<number>param + 8, tmp, 'i32')
    }
    opts.tolInt !== undefined && mod.setValue(<number>param + 16, opts.tolInt, 'double')
    opts.tolObj !== undefined && mod.setValue(<number>param + 24, opts.tolObj, 'double')
    opts.limitTime !== undefined && mod.setValue(<number>param + 32, opts.limitTime, 'i32')
    opts.logFreq !== undefined && mod.setValue(<number>param + 36, opts.logFreq, 'i32')
    opts.logDelay !== undefined && mod.setValue(<number>param + 40, opts.logDelay, 'i32')
    if (opts.callbackPtr !== undefined) {
      mod.setValue(<number>param + 44, <number>opts.callbackPtr, '*')
    }
    // cbInfo + 4
    // cbSize + 4
    if (opts.preprocessing !== undefined) {
      tmp = PreprocessingTechniques[opts.preprocessing]
      if (tmp === undefined)
        throw new Error(`unknown preprocessing technique '${opts.preprocessing}'`)
      mod.setValue(<number>param + 56, tmp, 'i32')
    }
    // padding + 4
    opts.gapMIP !== undefined && mod.setValue(<number>param + 64, opts.gapMIP, 'double')
    opts.cutsMIR !== undefined && mod.setValue(<number>param + 72, opts.cutsMIR ? 1 : 0, 'i32')
    opts.cutsGomory !== undefined &&
      mod.setValue(<number>param + 76, opts.cutsGomory ? 1 : 0, 'i32')
    opts.cutsCover !== undefined && mod.setValue(<number>param + 80, opts.cutsCover ? 1 : 0, 'i32')
    opts.cutsClique !== undefined &&
      mod.setValue(<number>param + 84, opts.cutsClique ? 1 : 0, 'i32')
    opts.presolve !== undefined && mod.setValue(<number>param + 88, opts.presolve ? 1 : 0, 'i32')
    opts.binarize !== undefined && mod.setValue(<number>param + 92, opts.binarize ? 1 : 0, 'i32')
    opts.heuristicFP !== undefined &&
      mod.setValue(<number>param + 96, opts.heuristicFP ? 1 : 0, 'i32')
    opts.heuristicPS !== undefined &&
      mod.setValue(<number>param + 100, opts.heuristicPS ? 1 : 0, 'i32')
    opts.limitProxy !== undefined && mod.setValue(<number>param + 104, opts.limitProxy, 'i32')
    opts.heuristicRound !== undefined &&
      mod.setValue(<number>param + 108, opts.heuristicRound ? 1 : 0, 'i32')
    return param
  }

  export function solve(model: Model, opts: Options): ReturnCode {
    // prepare option struct
    if (opts.callback !== undefined) {
      const callback = opts.callback
      opts.callbackPtr = mod.addFunction((treePtr: TreePtr) => callback(new Tree(treePtr)), 'vii')
    }
    const param = createStruct(opts || {})
    const retCode = mod._glp_intopt(model.ptr, param)
    mod._free(param)
    if (opts.callback !== undefined) {
      mod.removeFunction(<FunctionPtr>opts.callbackPtr)
      opts.callbackPtr = undefined
    }
    return getReturnCode(retCode)
  }
}
