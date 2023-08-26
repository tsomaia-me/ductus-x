import { createChannel, debug, delay, Effect, Effects, many, selectMessages, State } from '../src'
import { createWebSocketConnection } from '../src/connection/createWebSocketConnection'

export type AppState = State & {
  count: number
}

export type AppEffects = Effects<AppState>

const main = createChannel({
  id: 1,
  size: 3,
  connection: createWebSocketConnection(),
})

export function app(state: AppState, $: AppEffects): Effect {
  return many(
    debug(selectMessages(main, state).map(m => m.message)),
    // delay(500),
    $.stateful(state => delay(state.count * 500)),
    $.newState({ count: state.count + 1 }),
    $.send({
      channel: main,
      receiver: 1,
      message:`Hello: ${state.count}`,
    })
    // delay(500, debug(state)),
    // delay(500, debug(state.count + 1)),
  )
}
