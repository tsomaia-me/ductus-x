import {
  chain,
  Channel,
  ChannelMessage,
  delay,
  isChainEffect,
  isDelayEffect,
  isLogEffect,
  isManyEffect,
  isNewStateEffect,
  isSendEffect,
  isStatefulEffect,
  log,
  many,
  newState,
  NewStateEffect,
  send,
  stateful,
  StatefulEffect,
  withMessages
} from './effects'
import {
  App,
  Effect,
  EffectChannel,
  EffectHandlers,
  EffectsFrom,
  getInternalState,
  InternalStateUpdate,
  noop,
  RunnerParams,
  State,
  StateUpdate,
  withAddedInternalState,
  wrapInternalState
} from './lib'
import { handleChainEffect } from './runtime/handleChainEffect'
import { handleDelayEffect } from './runtime/handleDelayEffect'
import { handleLogEffect } from './runtime/handleLogEffect'
import { handleManyEffect } from './runtime/handleManyEffect'
import { handleNewStateEffect } from './runtime/handleNewState'
import { handleStatefulEffect } from './runtime/handleStatefulEffect'
import { handleSendEffect } from './runtime/handleSendEffect'

const BUILT_IN_EFFECT_HANDLERS = <S extends State>() => ({
  newState: {
    effect: newState as (state: StateUpdate<S>) => NewStateEffect<S>,
    test: isNewStateEffect,
    handle: handleNewStateEffect,
  },
  delay: { effect: delay, test: isDelayEffect, handle: handleDelayEffect },
  log: { effect: log, test: isLogEffect, handle: handleLogEffect },
  chain: { effect: chain, test: isChainEffect, handle: handleChainEffect },
  many: { effect: many, test: isManyEffect, handle: handleManyEffect },
  stateful: {
    effect: stateful as (toEffect: (state: S) => Effect) => StatefulEffect<S>,
    test: isStatefulEffect,
    handle: handleStatefulEffect,
  },
  withMessages: {
    effect: withMessages as (channel: Channel, toEffect: (messages: ChannelMessage[]) => Effect) => StatefulEffect<S>,
    test: isStatefulEffect,
    handle: handleStatefulEffect,
  },
  send: { effect: send, test: isSendEffect, handle: handleSendEffect },
})

type Task = {
  id: number
  effect: Effect
  cancel?: () => void
  onComplete: () => void
}

export function run<T extends State, E extends EffectHandlers<T>>(app: App<T, EffectsFrom<T, E>>, params: RunnerParams<T, E>) {
  const loopGenerator = loop()
  const effectHandlers = {
    ...BUILT_IN_EFFECT_HANDLERS<T>(),
    ...(params?.customEffectHandlers ?? {}),
  }
  const keys = Object.keys(effectHandlers) as Array<keyof typeof effectHandlers>
  const effects = keys.reduce((reduction: any, key) => {
    reduction[key] = effectHandlers[key]!.effect

    return reduction
  }, {} as EffectsFrom<T, E>) as EffectsFrom<T, E>
  let previousState = withAddedInternalState(params.initialState) as T
  let currentState = previousState
  let scheduledTasks: Task[] = []
  let runningTasks: Record<number, Task> = {}
  let numberOfRunningTasks = 0
  let isLoopRunning = false

  function handleEffect<T extends State>(effect: Effect, channel: EffectChannel<T>): () => void {
    for (let i = 0, l = keys.length; i < l; ++i) {
      const entry = effectHandlers[keys[i]]

      if (entry!.test(effect)) {
        return entry!.handle(effect as any, channel)! ?? noop
      }
    }

    return noop
  }

  function scheduleTask(effect: Effect, onComplete: () => void = noop) {
    scheduledTasks.unshift({ id: numberOfRunningTasks, effect, onComplete })

    if (!isLoopRunning) {
      loopGenerator.next()
    }
  }

  function onTopLevelTaskComplete() {
    if (scheduledTasks.length === 0 && numberOfRunningTasks === 0 && currentState !== previousState) {
      scheduleTask(app(currentState, effects), onTopLevelTaskComplete)
    }
  }

  function updateState(state: StateUpdate<T>) {
    const newState = typeof state === 'function'
      ? state(currentState)
      : state
    currentState = {
      ...currentState,
      ...newState,
    }
    scheduledTasks = []
    const runningTasksKeys = Object.keys(runningTasks) as unknown as Array<keyof typeof runningTasks>

    for (let i = 0, l = runningTasksKeys.length; i < l; ++i) {
      runningTasks[runningTasksKeys[i]].cancel?.()
    }

    scheduleTask(app(currentState, effects), onTopLevelTaskComplete)

    if (!isLoopRunning) {
      loopGenerator.next()
    }
  }

  function updateInternalState(state: InternalStateUpdate) {
    const newState = typeof state === 'function'
      ? state(getInternalState(currentState))
      : state

    currentState = {
      ...currentState,
      ...wrapInternalState({
        ...getInternalState(currentState),
        ...newState,
      }),
    }
  }

  function* loop() {
    while (true) {
      isLoopRunning = true
      while (scheduledTasks.length > 0) {
        const task = scheduledTasks.pop()!

        runningTasks[task.id] = task
        ++numberOfRunningTasks

        const cancel = handleEffect(task.effect, {
          getState: () => currentState,
          getInternalState: () => getInternalState(currentState),
          updateState: updateState,
          updateInternalState: updateInternalState,
          handle: scheduleTask,
          done: () => {
            --numberOfRunningTasks
            task.onComplete()
          }
        })
        task.cancel = () => {
          cancel()
          task.onComplete()
        }
      }
      isLoopRunning = false
      yield
    }
  }

  scheduleTask(app(currentState, effects), onTopLevelTaskComplete)
  loopGenerator.next()
}
