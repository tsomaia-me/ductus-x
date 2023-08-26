import { createEffect, Effect, isEffect } from '../new'

export type LogLevel =
  | 'default'
  | 'info'
  | 'debug'
  | 'error'

export const LOG_EFFECT = Symbol('LOG_EFFECT')

export interface LogEffect extends Effect {
  key: typeof LOG_EFFECT
  level: LogLevel
  args: unknown[]
}

export function isLogEffect(input: unknown): input is LogEffect {
  return isEffect(input) && input.key === LOG_EFFECT
}

export function log(level: LogLevel, ...args: unknown[]): LogEffect {
  return createEffect({
    key: LOG_EFFECT,
    level,
    args,
  })
}

export function logInfo(...args: unknown[]) {
  return log('info', ...args)
}

export function debug(...args: unknown[]) {
  return log('debug', ...args)
}

export function error(...args: unknown[]) {
  return log('error', ...args)
}
