import {
  getInternalChannelsState,
  InternalChannelState,
  SendEffect,
  withChannelInternalState,
  withoutChannelInternalState
} from '../effects'
import { EffectChannel, State } from '../lib'

export function handleSendEffect<T extends State>(effect: SendEffect, effectChannel: EffectChannel<T>) {
  const { channel, message } = effect
  const { channels } = getInternalChannelsState(effectChannel.getInternalState())

  function send(previousChannelState: InternalChannelState) {
    effectChannel.updateInternalState(previousState => withChannelInternalState(previousState, channel.id, {
      ...previousChannelState,
      lastMessageId: previousChannelState.lastMessageId + 1,
      messages: [
        ...previousChannelState.messages,
        {
          localId: previousChannelState.lastMessageId + 1,
          timeSent: new Date().getTime(),
          timeReceived: new Date().getTime(),
          sender: previousChannelState.sender,
          status: 'sending',
          message,
        },
      ]
    }))
  }

  function close() {
    effectChannel.updateInternalState(previousState => withoutChannelInternalState(previousState, channel.id))
  }

  if (channels?.[channel.id]) {
    send(channels[channel.id])
  } else {
    let channelState: InternalChannelState
    channelState = {
      id: channel.id,
      sender: -1,
      lastMessageId: 0,
      connection: channel.connector({
        channel,
        onOpen: params => {
          console.info('open', params)
          channelState.sender = params.participantId
          send(channelState)
        },
        onClose: close,
        onMessage: message => {
          message = {
            ...message,
            status: 'delivered',
          }
          effectChannel.updateInternalState(previousState => withChannelInternalState(previousState, channel.id, {
            ...channelState,
            messages: [
              ...channelState.messages,
              message,
            ]
          }))
        },
        onDelivered: messageId => {
          effectChannel.updateInternalState(previousState => withChannelInternalState(previousState, channel.id, {
            messages: channelState.messages.map(message => {
              if (message.sender !== channelState.sender || message.localId !== messageId) {
                return message
              }

              return {
                ...message,
                status: 'delivered',
              }
            })
          }))
        },
        onError: error => {
          console.error('error', error)
          close()
        }
      }),
      messages: []
    }
  }
}
