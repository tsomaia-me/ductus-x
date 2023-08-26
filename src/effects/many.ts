import { createEffect, Effect, isEffect } from '../lib'

export const MANY_EFFECT = Symbol('MANY_EFFECT')

export interface ManyEffect extends Effect {
  key: typeof MANY_EFFECT
  effects: Effect[]
}

export function isManyEffect(input: unknown): input is ManyEffect {
  return isEffect(input) && input.key === MANY_EFFECT
}

export function many(...effects: Effect[]): ManyEffect {
  return createEffect({
    key: MANY_EFFECT,
    effects,
  })
}
