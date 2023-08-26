import { createEffect, Effect, getInternalState, InternalState, isEffect, SerializableData, State } from '../lib'
import { stateful } from './stateful'
import { Connection } from '../connection/types'

export const SEND_EFFECT = Symbol('SEND_EFFECT')
const CHANNELS = Symbol('SEND_EFFECT')

export type ChannelParams<Params> = {
  id: number
  size?: number
  connection: Connection<Params>
}

export type Channel<Params> = {
  id: number
  size: number
  connection: Connection<Params>
}

export type ChannelMessage = {
  sender: number
  timeSent: number
  timeReceived: number | null
  message: SerializableData
}

export interface SendEffect extends Effect {
  key: typeof SEND_EFFECT
  channel: Channel<unknown>
  receiver: number
  message: SerializableData
}

export type SendParams = {
  channel: Channel<unknown>
  receiver: number
  message: SerializableData
}

export type InternalChannelState = {
  id: number
  sender: number
  messages: ChannelMessage[]
}

export type InternalChannelsState = {
  channels: Record<number, InternalChannelState>
}

export function isSendEffect(input: unknown): input is SendEffect {
  return isEffect(input) && input.key === SEND_EFFECT
}

export function createChannel<Params>(params: ChannelParams<Params>): Channel<Params> {
  return {
    ...params,
    size: params.size ?? 10,
  }
}

export function selectMessages<T extends State>(channel: Channel<unknown>, state: T): ChannelMessage[] {
  return getInternalState(state)?.[CHANNELS]?.channels[channel.id]?.messages ?? []
}

export function getInternalChannelsState(state: InternalState): InternalChannelsState {
  return state[CHANNELS] ?? {
    channels: {},
  }
}

export function withChannelInternalState(
  state: InternalState,
  previousChannelState: InternalChannelState,
  newChannelState: Partial<InternalChannelState>,
): InternalState {
  return {
    [CHANNELS]: {
      ...(state[CHANNELS] ?? {}),
      channels: {
        ...(state[CHANNELS]?.channels ?? {}),
        [previousChannelState.id]: {
          ...previousChannelState,
          ...(newChannelState ?? {}),
          messages: [
            ...previousChannelState.messages,
            ...(newChannelState.messages ?? []),
          ]
        }
      },
    }
  }
}

export function withMessages<T extends State>(channel: Channel<unknown>, toEffect: (messages: ChannelMessage[]) => Effect) {
  return stateful(state => toEffect(selectMessages(channel, state)))
}

export function send(params: SendParams): SendEffect {
  return createEffect({
    key: SEND_EFFECT,
    ...params,
  })
}
