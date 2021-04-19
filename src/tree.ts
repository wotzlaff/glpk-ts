import { mod } from './module'
import { TreePtr } from 'glpk-wasm'
import { Const } from './enums'
import Model from './model'

const ReasonCodes = {
  row: Const.ReasonCode.ROWGEN,
  improved: Const.ReasonCode.BINGO,
  heuristic: Const.ReasonCode.HEUR,
  cut: Const.ReasonCode.CUTGEN,
  branch: Const.ReasonCode.BRANCH,
  select: Const.ReasonCode.SELECT,
  preprocessing: Const.ReasonCode.PREPRO,
}
type ReasonCode = keyof typeof ReasonCodes
const ReverseReasonCodes = new Map(Object.entries(ReasonCodes).map(([k, v]) => [v, <ReasonCode>k]))

const RowOriginFlags = {
  regular: Const.RowOriginFlag.REG,
  lazy: Const.RowOriginFlag.LAZY,
  cut: Const.RowOriginFlag.CUT,
}
type RowOriginFlag = keyof typeof RowOriginFlags
const ReverseRowOriginFlags = new Map(
  Object.entries(RowOriginFlags).map(([k, v]) => [v, <RowOriginFlag>k])
)

const RowClasses = {
  gomory: Const.RowClass.GMI,
  mir: Const.RowClass.MIR,
  cover: Const.RowClass.COV,
  clique: Const.RowClass.CLQ,
}
type RowClass = keyof typeof RowClasses
const ReverseRowClasses = new Map(Object.entries(RowClasses).map(([k, v]) => [v, <RowClass>k]))

const BranchSelections = {
  down: Const.BranchSelection.DN_BRNCH,
  up: Const.BranchSelection.UP_BRNCH,
  general: Const.BranchSelection.NO_BRNCH,
}
type BranchSelection = keyof typeof BranchSelections

interface Attribute {
  level: number
  origin: RowOriginFlag
  cls: RowClass
}

interface TreeSize {
  active: number
  current: number
  total: number
}

export class Node {
  private readonly tree: Tree
  private readonly idx: number

  constructor(tree: Tree, idx: number) {
    this.tree = tree
    this.idx = idx
  }

  select() {
    mod._glp_ios_select_node(this.tree.ptr, this.idx)
  }

  get next(): Node | undefined {
    const idx = mod._glp_ios_next_node(this.tree.ptr, this.idx)
    if (idx === 0) return
    return new Node(this.tree, idx)
  }

  get previous(): Node | undefined {
    const idx = mod._glp_ios_prev_node(this.tree.ptr, this.idx)
    if (idx === 0) return
    return new Node(this.tree, idx)
  }

  get parent(): Node | undefined {
    const idx = mod._glp_ios_up_node(this.tree.ptr, this.idx)
    if (idx === 0) return
    return new Node(this.tree, idx)
  }

  get level(): number {
    return mod._glp_ios_node_level(this.tree.ptr, this.idx)
  }

  get bound(): number {
    return mod._glp_ios_node_bound(this.tree.ptr, this.idx)
  }
}

export class Tree {
  readonly ptr: TreePtr
  static _data: Ptr

  constructor(ptr: TreePtr) {
    this.ptr = ptr
  }

  static _alloc() {
    if (Tree._data === undefined) {
      Tree._data = mod._malloc(72)
    }
  }

  get reason(): ReasonCode {
    const code = mod._glp_ios_reason(this.ptr)
    const reason = ReverseReasonCodes.get(code)
    if (reason === undefined) throw new Error(`unknown reason code '${code}'`)
    return reason
  }

  get model(): Model {
    const ptr = mod._glp_ios_get_prob(this.ptr)
    return Model.fromPointer(ptr)
  }

  rowAttribute(idx: number): Attribute {
    Tree._alloc()
    mod._glp_ios_row_attr(this.ptr, idx, Tree._data)
    return {
      level: mod.getValue(<number>Tree._data + 0, 'i32'),
      origin: <RowOriginFlag>ReverseRowOriginFlags.get(mod.getValue(<number>Tree._data + 4, 'i32')),
      cls: <RowClass>ReverseRowClasses.get(mod.getValue(<number>Tree._data + 8, 'i32')),
    }
  }

  get gap(): number {
    return mod._glp_ios_mip_gap(this.ptr)
  }

  setHeuristicSolution(solution: number[] | Float64Array) {
    const size = solution.length
    const targetPtr = mod._malloc(size * 8)
    const targetArray = new Float64Array(mod.HEAPU8.buffer, <number>targetPtr, size)
    if (solution instanceof Float64Array) {
      solution.set(targetArray)
    } else {
      for (let [idx, val] of solution.entries()) {
        targetArray[idx] = val
      }
    }
    mod._glp_ios_heur_sol(this.ptr, targetPtr)
    mod._free(targetPtr)
  }

  canBranch(idx: number): number {
    return mod._glp_ios_can_branch(this.ptr, idx)
  }

  branchUpon(idx: number, select: BranchSelection) {
    const selectValue = BranchSelections[select]
    if (selectValue === undefined) throw new Error(`unknown branch selection '${select}'`)
    mod._glp_ios_branch_upon(this.ptr, idx, selectValue)
  }

  terminate() {
    mod._glp_ios_terminate(this.ptr)
  }

  get size(): TreeSize {
    Tree._alloc()
    const ptr = Tree._data
    mod._glp_ios_tree_size(this.ptr, ptr, <number>ptr + 4, <number>ptr + 8)
    return {
      active: mod.getValue(ptr, 'i32'),
      current: mod.getValue(<number>ptr + 4, 'i32'),
      total: mod.getValue(<number>ptr + 8, 'i32'),
    }
  }

  get currentNode(): Node | undefined {
    const idx = mod._glp_ios_curr_node(this.ptr)
    if (idx === 0) return
    return new Node(this, idx)
  }

  get bestNode(): Node | undefined {
    const idx = mod._glp_ios_best_node(this.ptr)
    if (idx === 0) return
    return new Node(this, idx)
  }

  get firstNode(): Node | undefined {
    const idx = mod._glp_ios_next_node(this.ptr, 0)
    if (idx === 0) return
    return new Node(this, idx)
  }

  get lastNode(): Node | undefined {
    const idx = mod._glp_ios_prev_node(this.ptr, 0)
    if (idx === 0) return
    return new Node(this, idx)
  }

  get cutPoolSize(): number {
    return mod._glp_ios_pool_size(this.ptr)
  }

  // TODO: implement addRow
  // TODO: implement removeRow

  clearCutPool() {
    mod._glp_ios_clear_pool(this.ptr)
  }
}

export default Tree
