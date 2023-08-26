import { LogEffect } from '../effects'
import { EffectChannel, State } from '../lib'

export function handleLogEffect<T extends State>(effect: LogEffect, channel: EffectChannel<T>) {
  switch (effect.level) {
    case 'default':
      console.log(...effect.args)
      break

    case 'info':
      console.info(...effect.args)
      break

    case 'debug':
      console.info(...effect.args)
      break

    case 'error':
      console.info(...effect.args)
      break
  }

  channel.done()
}
