import { Const } from './enums'

export type Status =
  | 'optimal'
  | 'feasible'
  | 'infeasible'
  | 'no_feasible'
  | 'unbounded'
  | 'undefined'

export type StatusSimplex = Status
export type StatusInterior =
  | 'undefined'
  | 'optimal'
  | 'infeasible'
  | 'no_feasible'
export type StatusMIP = 'undefined' | 'optimal' | 'feasible' | 'no_feasible'

const STATUS2RAW = new Map<Status, Const.Status>([
  ['optimal', Const.Status.OPTIMAL],
  ['feasible', Const.Status.FEASIBLE],
  ['infeasible', Const.Status.INFEASIBLE],
  ['no_feasible', Const.Status.NO_FEASIBLE],
  ['unbounded', Const.Status.UNBOUNDED],
  ['undefined', Const.Status.UNDEFINED],
])

const RAW2STATUS = new Map(Array.from(STATUS2RAW.entries(), ([k, v]) => [v, k]))

export function getStatus(stat: Const.Status): Status {
  return <Status>RAW2STATUS.get(stat)
}
