import { NewStateEffect } from '../effects/newState'
import { EffectChannel, State } from '../new'

export function handleNewStateEffect<T extends State>(effect: NewStateEffect<T>, channel: EffectChannel<T>) {
  channel.updateState(effect.state)
  channel.done()
}
