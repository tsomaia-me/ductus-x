import { createEffect, Effect, isEffect } from 'ductus'

const RENDER_EFFECT = Symbol('RENDER_EFFECT')

export interface RenderEffect extends Effect {
  key: typeof RENDER_EFFECT
  view: JSX.Element
}

export function isRenderEffect(input: unknown): input is RenderEffect {
  return isEffect(input) && input.key === RENDER_EFFECT
}

export function render(view: JSX.Element): RenderEffect {
  return createEffect({
    key: RENDER_EFFECT,
    view,
  })
}
