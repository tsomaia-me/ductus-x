import { ChainEffect } from '../effects'
import { EffectChannel, State } from '../lib'

export function handleChainEffect<T extends State>(effect: ChainEffect, channel: EffectChannel<T>) {
  void (async function chainLoop() {
    const effects = effect.effects.reverse()

    while (effects.length > 0) {
      const effect = effects.pop()!
      await new Promise<void>(resolve => channel.handle(effect, resolve))
    }

    channel.done()
  })()
}
