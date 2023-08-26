import { ChannelMessage } from '../effects'

export type Connection<Params> = {
  connect<Params>(params: Params, listeners: {
    onConnect: (participantId: number) => void
    onError: (error: unknown) => void
  }): void
  send(message: ChannelMessage): void
  disconnect(): void
  onDisconnect(listener: () => void): void
}
