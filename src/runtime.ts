import { CHAIN_EFFECT, ChainEffect, isChainEffect } from './effects/chain'
import { DELAY_EFFECT, DelayEffect, isDelayEffect } from './effects/delay'
import { isLogEffect, LOG_EFFECT, LogEffect } from './effects/log'
import { isManyEffect } from './effects/many'
import { isNewStateEffect, NEW_STATE_EFFECT, NewStateEffect } from './effects/newState'
import {
  App,
  Effect,
  EffectChannel,
  EffectHandler,
  getInternalState, noop,
  PublicState,
  State,
  StateUpdate,
  withAddedInternalState
} from './lib'
import { handleChainEffect } from './runtime/handleChainEffect'
import { handleDelayEffect } from './runtime/handleDelayEffect'
import { handleLogEffect } from './runtime/handleLogEffect'
import { handleManyEffect } from './runtime/handleManyEffect'
import { handleNewStateEffect } from './runtime/handleNewState'

const BUILT_IN_EFFECT_HANDLERS = [
  { test: isNewStateEffect, handle: handleNewStateEffect },
  { test: isDelayEffect, handle: handleDelayEffect },
  { test: isLogEffect, handle: handleLogEffect },
  { test: isChainEffect, handle: handleChainEffect },
  { test: isManyEffect, handle: handleManyEffect },
]

type Task = {
  id: number
  effect: Effect
  onComplete: () => void
}

export function createRunner<E extends Effect>(customEffectHandlers: Array<{ test: (input: unknown)=> input is E, handle: EffectHandler<E> }> = []) {
  const effectHandlers = [
    ...BUILT_IN_EFFECT_HANDLERS,
    ...customEffectHandlers,
  ]

  function handleEffect<T extends State>(effect: Effect, channel: EffectChannel<T>) {
    for (let i = 0, l = effectHandlers.length; i < l; ++i) {
      const entry = effectHandlers[i]

      if (entry.test(effect)) {
        entry.handle(effect as any, channel)
      }
    }
  }

  return function run<T extends State>(app: App<T>, params: {
    initialState: PublicState<T>
  }) {
    let previousState = withAddedInternalState(params.initialState) as T
    let currentState = previousState
    let scheduledTasks: Task[] = []
    let runningTasks: Record<number, Task> = {}
    let numberOfRunningTasks = 0
    let isLoopRunning = false
    const loopGenerator = loop()

    function scheduleTask(effect: Effect, onComplete: () => void = noop) {
      scheduledTasks.push({ id: numberOfRunningTasks, effect, onComplete })

      if (!isLoopRunning) {
        loopGenerator.next()
      }
    }

    function onTopLevelTaskComplete() {
      if (scheduledTasks.length === 0 && numberOfRunningTasks === 0 && currentState !== previousState) {
        scheduleTask(app(currentState), onTopLevelTaskComplete)
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
    }

    function* loop() {
      while (true) {
        isLoopRunning = true
        while (scheduledTasks.length > 0) {
          const task = scheduledTasks.pop()!

          runningTasks[task.id] = task
          ++numberOfRunningTasks
          handleEffect(task.effect, {
            getState: () => currentState,
            getInternalState: () => getInternalState(currentState),
            updateState: updateState,
            handle: scheduleTask,
            done: () => {
              --numberOfRunningTasks
              task.onComplete()
            }
          })
        }
        isLoopRunning = false
        yield
      }
    }

    scheduleTask(app(currentState), onTopLevelTaskComplete)
    loopGenerator.next()
  }
}
