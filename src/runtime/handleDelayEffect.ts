import { DelayEffect } from '../effects'
import { EffectChannel, State } from '../lib'

export function handleDelayEffect<T extends State>(effect: DelayEffect, channel: EffectChannel<T>) {
  setTimeout(channel.done, effect.timeout)
}
