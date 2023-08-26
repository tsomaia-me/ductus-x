import {
  Connection,
  Connector,
  createEffect,
  Effect,
  getInternalState,
  InternalState,
  isEffect,
  SerializableData,
  State
} from '../lib'
import { stateful } from './stateful'

export const SEND_EFFECT = Symbol('SEND_EFFECT')
const CHANNELS = Symbol('SEND_EFFECT')

export type ChannelParams = {
  id: number
  size?: number
  connector: Connector
}

export type Channel = {
  id: number
  size: number
  connector: Connector
}

export type ChannelMessageStatus = 'sending' | 'sent' | 'delivered' | 'failed'

export type ChannelMessage = {
  localId: number
  sender: number
  timeSent: number
  timeReceived: number | null
  status: ChannelMessageStatus
  message: SerializableData
}

export interface SendEffect extends Effect {
  key: typeof SEND_EFFECT
  channel: Channel
  receiver: number
  message: SerializableData
}

export type SendParams = {
  channel: Channel
  receiver: number
  message: SerializableData
}

export type InternalChannelState = {
  id: number
  sender: number
  lastMessageId: number
  connection: Connection
  messages: ChannelMessage[]
}

export type InternalChannelsState = {
  channels: Record<number, InternalChannelState>
}

export function isSendEffect(input: unknown): input is SendEffect {
  return isEffect(input) && input.key === SEND_EFFECT
}

export function createChannel(params: ChannelParams): Channel {
  return {
    ...params,
    size: params.size ?? 10,
  }
}

export function selectMessages<T extends State>(channel: Channel, state: T): ChannelMessage[] {
  return getInternalState(state)?.[CHANNELS]?.channels[channel.id]?.messages ?? []
}

export function getInternalChannelsState(state: InternalState): InternalChannelsState {
  return state[CHANNELS] ?? {
    channels: {},
  }
}

export function withChannelInternalState(
  state: InternalState,
  channelId: number,
  newChannelState: Partial<InternalChannelState>,
): InternalState {
  return {
    [CHANNELS]: {
      ...(state[CHANNELS] ?? {}),
      channels: {
        ...(state[CHANNELS]?.channels ?? {}),
        [channelId]: newChannelState,
      },
    }
  }
}

export function withoutChannelInternalState(
  state: InternalState,
  channelId: number,
): InternalState {
  const { [channelId]: _, ...restChannels } = state[CHANNELS]?.channels ?? {}

  return {
    [CHANNELS]: {
      ...(state[CHANNELS] ?? {}),
      channels: restChannels,
    }
  }
}

export function withMessages<T extends State>(channel: Channel, toEffect: (messages: ChannelMessage[]) => Effect) {
  return stateful(state => toEffect(selectMessages(channel, state)))
}

export function send(params: SendParams): SendEffect {
  return createEffect({
    key: SEND_EFFECT,
    ...params,
  })
}
