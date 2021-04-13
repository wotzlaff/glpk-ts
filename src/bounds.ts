import { RawBoundType } from './enums'

export function getBoundType(lb?: number, ub?: number): RawBoundType {
  if (lb === undefined) {
    if (ub === undefined) return RawBoundType.FREE
    return RawBoundType.UB
  }
  if (ub === undefined) return RawBoundType.LB
  if (lb === ub) return RawBoundType.FIXED
  return RawBoundType.BOUNDED
}
