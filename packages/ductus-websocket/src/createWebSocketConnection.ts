import { ChannelMessage, Connector, ConnectionParams } from 'ductus'
import { w3cwebsocket as WebSocket } from 'websocket'
import { isDeliveredEvent, isMessageEvent, isOpenEvent } from './utils'

export type WebSocketConnectionCreationParams = {
  url: string
}

export type BaseEvent<T extends string, B extends object> = {
  type: T
  body: B
}

export type OpenEvent = BaseEvent<'open', {
  participantId: number
  peers: number[]
}>

export type MessageEvent = BaseEvent<'message', ChannelMessage>

export type DeliveredEvent = BaseEvent<'delivered', {
  providedLocalId: number
}>

export function createWebSocketConnection(params: WebSocketConnectionCreationParams): Connector {
  return (connectionParams: ConnectionParams) => {
    const { channel, onOpen, onClose, onMessage, onError, onDelivered } = connectionParams
    const connection = new WebSocket(`${params.url}/${channel.id}`)

    connection.onclose = onClose
    connection.onerror = onError
    connection.onmessage = event => {
      const message = JSON.parse(event.data.toString())

      if (isOpenEvent(message)) {
        onOpen(message.body)
      } else if (isMessageEvent(message)) {
        onMessage({
          ...message.body,
          timeReceived: new Date().getTime(),
          status: 'delivered',
        })
      } else if (isDeliveredEvent(message)) {
        onDelivered(message.body.providedLocalId)
      }
    }

    function send(message: ChannelMessage): void {
      connection.send(JSON.stringify(message))
    }

    function close(): void {
      connection.close()
    }

    return {
      send,
      close,
    }
  }
}
