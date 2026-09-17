import Fastify from 'fastify'
import cors from '@fastify/cors'

import { ActivityRoutes } from './modules/activities/activity.routes'

export function BuildApp() {
  const app = Fastify({
    logger: true
  })

  app.register(cors, {
    origin: true
  })

  app.get('/health', async () => {
    return {
      status: 'ok'
    }
  })

  app.register(ActivityRoutes)

  return app
}
