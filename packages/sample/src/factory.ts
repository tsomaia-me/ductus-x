import { createFactory } from 'ductus'
import { withDuctusEffects } from 'ductus-view'

export const { createApp, run } = createFactory({
  initialState: {
    count: 0,
  },
  customEffectHandlers: withDuctusEffects({}),
})
