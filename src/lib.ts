const EFFECT = Symbol()
const INTERNAL_STATE = Symbol()

export type InternalState = Record<symbol, any>

export type State = {
  [INTERNAL_STATE]: InternalState
}

export type PublicState<T extends State> = Omit<State, typeof INTERNAL_STATE>

export type StateUpdate<T extends State> = Partial<T> | ((previousState: T) => Partial<T>)

export type EffectChannel<T extends State> = {
  getState: () => State
  getInternalState(): InternalState
  updateState: (state: StateUpdate<T>) => void
  handle: (effect: Effect, onComplete?: () => void) => void
  done: () => void
}

export type EffectHandler<E extends Effect> = <T extends State>(effect: E, channel: EffectChannel<T>) => void

export type App<T extends State> = (state: T) => Effect

export interface Effect {
  type: typeof EFFECT
  key: symbol
}

export function isObject(input: unknown): input is object {
  return typeof input === 'object' && input !== null
}

export function hasProperty<T extends keyof any>(input: object, property: T): input is { [K in T]: unknown } {
  return input.hasOwnProperty(property)
}

export function isEffect(input: unknown): input is Effect {
  return isObject(input) && hasProperty(input, 'type') && input.type === EFFECT
}

export function getInternalState<T extends State>(input: T) {
  return input[INTERNAL_STATE]
}

export function withAddedInternalState<T>(state: T): State & T {
  return {
    ...state,
    [INTERNAL_STATE]: {},
  }
}

export function withInternalState<T extends State>(state: T, newInternalState: InternalState) {
  return {
    ...state,
    [INTERNAL_STATE]: {
      ...(state[INTERNAL_STATE] ?? {}),
      ...newInternalState,
    }
  }
}

export function createEffect<T extends { key: symbol }>(params: T): Effect & T {
  return {
    type: EFFECT,
    ...params,
  }
}

export function noop() {
}
