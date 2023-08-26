import { server as WebSocketServer } from 'websocket'
import * as http from 'http'

export type WebSocketServerParams = {
  port: number
}

export type Participant = {
  id: number
}

export type Channel = {
  participants: Array<Participant>
}

export function createWebSocketServer(params: WebSocketServerParams) {
  const { port } = params
  const server = http.createServer((request, response) => {
    response.writeHead(404)
    response.end()
  })
  const webSocketServer = new WebSocketServer(({
    httpServer: server,
    autoAcceptConnections: false,
  }))
  const channels = new Map<number, Channel>()

  webSocketServer.on('request', request => {
    const segments = request.resourceURL.path?.split(/\//g) ?? []
    const channelId = Number(segments[segments.length - 1])

    if (isNaN(channelId)) {
      request.reject()
      return
    }

    const connection = request.accept()

    function send(message: object) {
      connection.send(JSON.stringify(message))
    }

    if (!channels.has(channelId)) {
      channels.set(channelId, {
        participants: []
      })
    }

    const channel = channels.get(channelId)!
    const participant = {
      id: channel.participants.length + 1,
    }
    const peers = channel.participants.map(participant => participant.id)

    channel.participants.push(participant)

    send({
      type: 'open',
      body: {
        participantId: participant.id,
        peers,
      }
    })
  })

  server.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })

  return {}
}
