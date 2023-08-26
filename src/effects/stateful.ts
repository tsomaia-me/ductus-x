import { createEffect, Effect, isEffect } from '../lib'

export const NEW_STATE_EFFECT = Symbol('NEW_STATE_EFFECT')

export interface NewStateEffect<T> extends Effect {
  key: typeof NEW_STATE_EFFECT
  state: T
}

export function isNewStateEffect(input: unknown): input is NewStateEffect<unknown> {
  return isEffect(input) && input.key === NEW_STATE_EFFECT
}

export function newState<T>(state: T): NewStateEffect<T> {
  return createEffect({
    key: NEW_STATE_EFFECT,
    state,
  })
}
