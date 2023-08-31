import { EffectHandlers } from 'ductus'
import { isRenderEffect, render } from './effects'
import { handleRenderEffect } from './runtime/handlers/handleRenderEffect'

export function withDuctusEffects<S>(effectHandlers: EffectHandlers<S>) {
  return {
    ...effectHandlers,
    delay: { effect: render, test: isRenderEffect, handle: handleRenderEffect },
  }
}
