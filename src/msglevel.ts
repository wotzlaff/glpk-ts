import { Const } from './enums'
export type MessageLevel = 'all' | 'on' | 'off' | 'error' | 'debug'

export function getMessageLevel(msgLevel: MessageLevel): Const.MessageLevel {
  const res = {
    all: Const.MessageLevel.ALL,
    on: Const.MessageLevel.ON,
    off: Const.MessageLevel.OFF,
    debug: Const.MessageLevel.DBG,
    error: Const.MessageLevel.ERR,
  }[msgLevel]
  if (res === undefined) throw new Error(`unknown message level '${msgLevel}'`)
  return res
}
