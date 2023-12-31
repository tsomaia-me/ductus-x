import {
  ChainEffect,
  Channel,
  ChannelMessage,
  DelayEffect,
  LogEffect,
  LogLevel,
  ManyEffect,
  NewStateEffect,
  SendParams,
  StatefulEffect
} from './effects'
import { _run } from './runtime'

const EFFECT = Symbol()
const INTERNAL_STATE = Symbol()

export type InternalState = Record<symbol, any>

export type State = {
  [INTERNAL_STATE]: InternalState
}

export type WithInternalState<T> = State & T

export type Effects<S> = SafeEffects<WithInternalState<S>>

export type SafeEffects<S extends State> = {
  newState: (state: StateUpdate<WithInternalState<S>>) => NewStateEffect<S>
  delay: (timeout: number) => DelayEffect
  log: (level: LogLevel, ...args: unknown[]) => LogEffect
  chain: (...effects: Effect[]) => ChainEffect
  many: (...effects: Effect[]) => ManyEffect
  stateful: (toEffect: (state: PublicState<S>) => Effect) => StatefulEffect<S>
  withMessages: (channel: Channel, toEffect: (messages: ChannelMessage[]) => Effect) => StatefulEffect<S>
  send: (params: SendParams) => StatefulEffect<S>
}

export type EffectHandlers<S> = Record<any, {
  effect: (...args: any) => Effect
  test: (input: unknown) => input is Effect
  handle: (effect: Effect, channel: EffectChannel<WithInternalState<S>>) => void | (() => void)
}>

export type PublicState<T extends State> = {
  [K in Exclude<keyof T, typeof INTERNAL_STATE>]: T[K]
}

export type StateUpdate<T> = Partial<T> | ((previousState: T) => Partial<T>)
export type InternalStateUpdate = Partial<InternalState> | ((previousState: InternalState) => Partial<InternalState>)

export type EffectChannel<T> = {
  getState: () => WithInternalState<T>
  getInternalState(): InternalState
  updateState: (state: StateUpdate<T>) => void
  updateInternalState: (state: InternalStateUpdate) => void
  handle: (effect: Effect, onComplete?: () => void) => void | (() => void)
  done: () => void
}

export type EffectHandler<E extends Effect> = <T extends State>(effect: E, channel: EffectChannel<T>) => void

export type App<T, E extends Effects<T>> = (state: T, effects_as_$: E) => Effect

export interface Effect {
  type: typeof EFFECT
  key: symbol
}

export type RunnerParams<T, E extends EffectHandlers<T>> = {
  initialState: T
  customEffectHandlers?: EffectHandlers<T>
}

export type EffectsFrom<T, E extends EffectHandlers<T>> = Effects<T> & {
  [K in keyof E]: E[K]['effect']
}

export type Runner = {
  <T, E extends EffectHandlers<T>>(app: App<T, EffectsFrom<T, E>>, params: RunnerParams<T, E>): void
}

export type ConnectionParams = {
  channel: Channel
  onOpen: (result: ConnectionResult) => void
  onClose: () => void
  onMessage: (message: ChannelMessage) => void
  onDelivered: (messageId: number) => void
  onError: (error: unknown) => void
}

export type ConnectionResult = {
  participantId: number
  peers: number[]
}

export type Connector = {
  (params: ConnectionParams): Connection
}

export type Connection = {
  send: (message: ChannelMessage) => void
  close: () => void
}

export type SerializableValue = string | number | null

export interface SerializableArray extends Array<SerializableData> {
}

export interface SerializableObject extends Record<string, SerializableData> {
}

export type SerializableData =
  | SerializableValue
  | SerializableArray
  | SerializableObject

export type ArrayValue<T extends Array<unknown>> = T extends Array<infer U> ? U : never

export function isObject(input: unknown): input is object {
  return typeof input === 'object' && input !== null
}

export function hasProperty<T extends keyof any>(input: object, property: T): input is { [K in T]: unknown } {
  return input.hasOwnProperty(property)
}

export function isEffect(input: unknown): input is Effect {
  return isObject(input) && hasProperty(input, 'type') && input.type === EFFECT
}

export function getInternalState<T extends State>(state: T) {
  return state[INTERNAL_STATE]
}

export function wrapInternalState(state: InternalState) {
  return {
    [INTERNAL_STATE]: state,
  }
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

export function toHashMap<T extends Array<string>>(...values: [...T]) {
  return values.reduce((reduction, value) => {
    reduction[value as unknown as keyof typeof reduction] = true

    return reduction
  }, {} as Record<ArrayValue<[...T]>, true>)
}

export function createFactory<T, E extends EffectHandlers<any>>(params: RunnerParams<T, E>) {
  function createApp(app: App<T, EffectsFrom<T, E>>) {
    return app
  }

  function run(app: App<T, EffectsFrom<T, E>>) {
    _run(app, params)
  }

  return {
    createApp,
    run,
  }
}
