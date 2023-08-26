import { run } from '../src'
import { app } from './app'

run(app, {
  initialState: {
    count: 0,
  }
})
