import { createEffect, Effect, isEffect, State } from '../lib'

export const STATEFUL_EFFECT = Symbol('STATEFUL_EFFECT')

export interface StatefulEffect<T extends State> extends Effect {
  key: typeof STATEFUL_EFFECT
  toEffect: (state: T) => Effect
}

export function isStatefulEffect(input: unknown): input is StatefulEffect<any> {
  return isEffect(input) && input.key === STATEFUL_EFFECT
}

export function stateful<T extends State>(toEffect: (state: T) => Effect): StatefulEffect<T> {
  return createEffect({
    key: STATEFUL_EFFECT,
    toEffect,
  })
}
