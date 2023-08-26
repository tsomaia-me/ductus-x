import { run } from 'ductus'
import { app } from './app'

run(app, {
  initialState: {
    count: 0,
  }
})
