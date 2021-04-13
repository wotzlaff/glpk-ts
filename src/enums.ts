export enum RawObjectiveDirection {
  MIN = 1,
  MAX = 2,
}
export enum RawBoundType {
  FREE = 1,
  LB = 2,
  UB = 3,
  BOUNDED = 4,
  FIXED = 5,
}

export enum RawVariableStatus {
  BASIC = 1,
  LB = 2,
  UB = 3,
  FREE = 4,
  FIXED = 5,
}

export enum RawVariableType {
  CONTINUOUS = 1,
  INTEGER = 2,
  BINARY = 3,
}

export enum RawScaling {
  GEOMETRIC_MEAN = 0x01,
  EQUILIBRATION = 0x10,
  POWER_TWO = 0x20,
  SKIP = 0x40,
  AUTO = 0x80,
}

export enum RawSolutionIndicator {
  BASIC = 1,
  INTERIOR_POINT = 2,
  MIXED_INTEGER = 3,
}

export enum RawStatus {
  UNDEFINED = 1,
  FEASIBLE = 2,
  INFEASIBLE = 3,
  NO_FEASIBLE = 4,
  OPTIMAL = 5,
  UNBOUNDED = 6,
}

export enum RawMessageLevel {
  OFF = 0,
  ERROR = 1,
  ON = 2,
  ALL = 3,
  DEBUG = 4,
}

export enum RawMethod {
  PRIMAL = 1,
  DUAL_PRIMAL = 2,
  DUAL = 3,
}

export enum RawPricing {
  STANDARD = 0x11,
  STEEPEST_EDGE = 0x22,
}

export enum RawRatioTest {
  STANDARD = 0x11,
  HARRIS = 0x22,
  FLIPFLOP = 0x33,
}
