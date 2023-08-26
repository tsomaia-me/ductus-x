import { debug, delay, Effect, many, newState, State } from '../src'

export type AppState = State & {
  count: 0
}

export function app(state: AppState): Effect {
  return many(
    debug(state.count),
    delay(500),
    newState({ count: state.count + 1 }),
    // delay(500, debug(state)),
    // delay(500, debug(state.count + 1)),
  )
}
