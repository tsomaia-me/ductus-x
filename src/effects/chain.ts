import { createEffect, Effect, isEffect } from '../new'

export const CHAIN_EFFECT = Symbol('CHAIN_EFFECT')

export interface ChainEffect extends Effect {
  key: typeof CHAIN_EFFECT
  effects: Effect[]
}

export function isChainEffect(input: unknown): input is ChainEffect {
  return isEffect(input) && input.key === CHAIN_EFFECT
}

export function chain(...effects: Effect[]): ChainEffect {
  return createEffect({
    key: CHAIN_EFFECT,
    effects,
  })
}
