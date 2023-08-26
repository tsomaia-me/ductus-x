import { EffectChannel, State } from '../lib'
import { StatefulEffect } from '../effects/stateful'

export function handleStatefulEffect<T extends State>(effect: StatefulEffect<T>, channel: EffectChannel<T>) {
  channel.handle(effect.toEffect(channel.getState()), channel.done)
}
