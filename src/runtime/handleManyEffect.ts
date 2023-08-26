import { ManyEffect } from '../effects/many'
import { EffectChannel, noop, State } from '../new'

export function handleManyEffect<T extends State>(effect: ManyEffect, channel: EffectChannel<T>) {
  const effects = effect.effects
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

  for (let i = 0, l = effects.length; i < l; ++i) {
    channel.handle(effects[i], handleEffectDone)
  }
}
