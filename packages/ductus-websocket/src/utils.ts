import { ChannelMessage, hasProperty, isObject, toHashMap } from 'ductus'
import { BaseEvent, DeliveredEvent, MessageEvent, OpenEvent } from './createWebSocketConnection'

const STATUS_MAP = toHashMap('sending', 'sent', 'delivered', 'failed')

export function isBaseEvent<T extends string>(input: unknown, type: T): input is BaseEvent<T, any> {
  return isObject(input)
    && hasProperty(input, 'type')
    && hasProperty(input, 'body')
    && input.type === type
    && isObject(input.body)
}

export function isOpenEvent(input: unknown): input is OpenEvent {
  return isBaseEvent(input, 'open')
    && hasProperty(input.body, 'participantId')
    && hasProperty(input.body, 'peers')
    && typeof input.body.participantId === 'number'
    && Array.isArray(input.body.peers)
    && input.body.peers.every(peer => typeof peer === 'number')
}

export function isMessageEvent(input: unknown): input is MessageEvent {
  return isBaseEvent(input, 'message') && isChannelMessage(input.body)
}

export function isDeliveredEvent(input: unknown): input is DeliveredEvent {
  return isBaseEvent(input, 'delivered')
    && hasProperty(input.body, 'providedLocalId')
    && typeof input.body.providedLocalId === 'number'
}

export function isChannelMessage(input: unknown): input is ChannelMessage {
  return isObject(input)
    && hasProperty(input, 'localId')
    && hasProperty(input, 'sender')
    && hasProperty(input, 'timeSent')
    && hasProperty(input, 'timeReceived')
    && hasProperty(input, 'status')
    && hasProperty(input, 'message')
    && typeof input.localId === 'number'
    && typeof input.sender === 'number'
    && typeof input.timeSent === 'number'
    && input.timeReceived === null
    && typeof input.status === 'string'
    && STATUS_MAP.hasOwnProperty(input.status)
}
