import { createRunner } from '../src/runtime'
import { app } from './new.app'

const run = createRunner()

run(app, {
  initialState: {
    count: 0,
  }
})
