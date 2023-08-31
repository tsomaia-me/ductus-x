import { createEffect, Effect, isEffect, State, StateUpdate } from '../lib'

const NEW_STATE_EFFECT = Symbol('NEW_STATE_EFFECT')

export interface NewStateEffect<T extends State> extends Effect {
  key: typeof NEW_STATE_EFFECT
  state: StateUpdate<T>
}

export function isNewStateEffect(input: unknown): input is NewStateEffect<any> {
  return isEffect(input) && input.key === NEW_STATE_EFFECT
}

export function newState<T extends State>(state: StateUpdate<T>): NewStateEffect<T> {
  return createEffect({
    key: NEW_STATE_EFFECT,
    state,
  })
}
