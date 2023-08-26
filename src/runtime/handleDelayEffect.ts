import { DelayEffect } from '../effects/delay'
import { EffectChannel, State } from '../new'

export function handleDelayEffect<T extends State>(effect: DelayEffect, channel: EffectChannel<T>) {
  setTimeout(channel.done, effect.timeout)
}
