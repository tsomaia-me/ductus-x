import { ManyEffect } from '../effects'
import { EffectChannel, State } from '../lib'

export function handleManyEffect<T extends State>(effect: ManyEffect, channel: EffectChannel<T>) {
  const { effects } = effect
  let numberOfRunningEffects = effects.length

  if (numberOfRunningEffects === 0) {
    channel.done()
    return
  }

  function handleEffectDone() {
    --numberOfRunningEffects

    if (numberOfRunningEffects === 0) {
      channel.done()
    }
  }

  const cancellers: Array<() => void> = []

  for (let i = 0, l = effects.length; i < l; ++i) {
    const cancel = channel.handle(effects[i], handleEffectDone)

    if (cancel) {
      cancellers.push(cancel)
    }
  }

  return () => cancellers.forEach(cancel => cancel())
}
