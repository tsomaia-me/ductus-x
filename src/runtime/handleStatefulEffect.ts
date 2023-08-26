import { NewStateEffect } from '../effects'
import { EffectChannel, State } from '../lib'

export function handleNewStateEffect<T extends State>(effect: NewStateEffect<T>, channel: EffectChannel<T>) {
  channel.updateState(effect.state)
  channel.done()
}
