import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'

import { ActivityRoutes } from './modules/activities/activity.routes.js'
import { AuthRoutes } from './modules/auth/auth.routes.js'

export async function BuildApp() {
  const app = Fastify()

  const jwtSecret = process.env.JWT_SECRET
  const clientUrl = process.env.CLIENT_URL

  if(!jwtSecret) {
    throw new Error("JWT-SECRET is not defined")
  }

  if(!clientUrl) {
    throw new Error("CLIENT_URL is not defined")
  }

  await app.register(cors, {
    origin: clientUrl,
    credentials: true,
    methods: [
    "GET",
    "POST",
    "PATCH",
    "PUT",
    "DELETE",
    "OPTIONS"
  ]
  })

  await app.register(cookie)

  await app.register(jwt, {
    secret: jwtSecret
  })

  app.register(AuthRoutes)
  app.register(ActivityRoutes)

  return app
}
