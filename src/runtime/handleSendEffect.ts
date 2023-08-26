import { getInternalChannelsState, InternalChannelState, SendEffect, withChannelInternalState } from '../effects'
import { EffectChannel, getInternalState, State } from '../lib'

export function handleSendEffect<T extends State>(effect: SendEffect, effectChannel: EffectChannel<T>) {
  const { channel, message } = effect
  const { channels } = getInternalChannelsState(effectChannel.getInternalState())
  const previousChannelState: InternalChannelState = channels?.[channel.id] ?? {
    id: channel.id,
    sender: Math.floor(Math.random() * 100000) / 10000,
    messages: []
  }

  effectChannel.updateInternalState(previousState => withChannelInternalState(previousState, previousChannelState, {
    messages: [
      {
        message,
        timeSent: new Date().getTime(),
        timeReceived: new Date().getTime(),
        sender: previousChannelState.sender,
      },
    ]
  }))
}
