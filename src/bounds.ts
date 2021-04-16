import { Const } from './enums'

export function getBoundType(lb?: number, ub?: number): Const.BoundType {
  if (lb === undefined) {
    if (ub === undefined) return Const.BoundType.FREE
    return Const.BoundType.UB
  }
  if (ub === undefined) return Const.BoundType.LB
  if (lb === ub) return Const.BoundType.FIXED
  return Const.BoundType.BOUNDED
}
