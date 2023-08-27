import { ChainEffect } from '../effects'
import { EffectChannel, State } from '../lib'

const CANCELLATION = Symbol()

export function handleChainEffect<T extends State>(effect: ChainEffect, channel: EffectChannel<T>) {
  const effects = effect.effects.reverse()
  let onCancel: (() => void) | undefined

  void (async function chainLoop() {
    while (effects.length > 0) {
      const effect = effects.pop()!
      await new Promise<void>((resolve, reject) => {
        const cancel = channel.handle(effect, resolve)

        if (cancel) {
          onCancel = () => {
            cancel()
            reject(CANCELLATION)
          }
        }
      })
    }

    channel.done()
  })().catch()

  return () => {
    onCancel?.()
  }
}
