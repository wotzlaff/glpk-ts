export namespace Const {
  export enum ObjectiveDirection {
    MIN = 1,
    MAX = 2,
  }
  export enum BoundType {
    FREE = 1,
    LB = 2,
    UB = 3,
    BOUNDED = 4,
    FIXED = 5,
  }

  export enum VariableStatus {
    BASIC = 1,
    LB = 2,
    UB = 3,
    FREE = 4,
    FIXED = 5,
  }

  export enum VariableType {
    CONTINUOUS = 1,
    INTEGER = 2,
    BINARY = 3,
  }

  export enum Scaling {
    GEOMETRIC_MEAN = 0x01,
    EQUILIBRATION = 0x10,
    POWER_TWO = 0x20,
    SKIP = 0x40,
    AUTO = 0x80,
  }

  export enum SolutionIndicator {
    BASIC = 1,
    INTERIOR_POINT = 2,
    MIXED_INTEGER = 3,
  }

  export enum Status {
    UNDEFINED = 1,
    FEASIBLE = 2,
    INFEASIBLE = 3,
    NO_FEASIBLE = 4,
    OPTIMAL = 5,
    UNBOUNDED = 6,
  }

  export enum MessageLevel {
    OFF = 0, // no output
    ERR = 1, // warning and error messages only
    ON = 2, // normal output
    ALL = 3, // full output
    DBG = 4, // debug output
  }

  export enum Method {
    PRIMAL = 1, // use primal simplex
    DUALP = 2, // use dual; if it fails, use primal
    DUAL = 3, // use dual simplex
  }

  export enum Pricing {
    STD = 0x11, // standard (Dantzig's rule)
    PSE = 0x22, // projected steepest edge
  }

  export enum RatioTest {
    STD = 0x11, // standard (textbook)
    HAR = 0x22, // Harris' two-pass ratio test
    FLIP = 0x33, // long-step (flip-flop) ratio test
  }

  export enum OrderingAlgorithm {
    NONE = 0, // natural (original) ordering
    QMD = 1, // quotient minimum degree (QMD)
    AMD = 2, // approx. minimum degree (AMD)
    SYMAMD = 3, // approx. minimum degree (SYMAMD)
  }

  export enum ReturnCode {
    OK = 0x00,
    EBADB = 0x01, // invalid basis
    ESING = 0x02, // singular matrix
    ECOND = 0x03, // ill-conditioned matrix
    EBOUND = 0x04, // invalid bounds
    EFAIL = 0x05, // solver failed
    EOBJLL = 0x06, // objective lower limit reached
    EOBJUL = 0x07, // objective upper limit reached
    EITLIM = 0x08, // iteration limit exceeded
    ETMLIM = 0x09, // time limit exceeded
    ENOPFS = 0x0a, // no primal feasible solution
    ENODFS = 0x0b, // no dual feasible solution
    EROOT = 0x0c, // root LP optimum not provided
    ESTOP = 0x0d, // search terminated by application
    EMIPGAP = 0x0e, // relative mip gap tolerance reached
    ENOFEAS = 0x0f, // no primal/dual feasible solution
    ENOCVG = 0x10, // no convergence
    EINSTAB = 0x11, // numerical instability
    EDATA = 0x12, // invalid data
    ERANGE = 0x13, // result out of range
  }
}
