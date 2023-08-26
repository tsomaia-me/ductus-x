import { debug, delay, Effect, Effects, many, newState, State } from '../src'

export type AppState = State & {
  count: 0
}

export function app(state: AppState, $: Effects<AppState>): Effect {
  return many(
    debug(state.count),
    // delay(500),
    $.stateful(state => delay(state.count)),
    newState({ count: state.count + 1 }),
    // delay(500, debug(state)),
    // delay(500, debug(state.count + 1)),
  )
}
