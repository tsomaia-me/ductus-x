import { createEffect, Effect, isEffect } from '../lib'

export const DELAY_EFFECT = Symbol('DELAY_EFFECT')

export interface DelayEffect extends Effect {
  key: typeof DELAY_EFFECT
  timeout: number
}

export function isDelayEffect(input: unknown): input is DelayEffect {
  return isEffect(input) && input.key === DELAY_EFFECT
}

export function delay(timeout: number): DelayEffect {
  return createEffect({
    key: DELAY_EFFECT,
    timeout,
  })
}
