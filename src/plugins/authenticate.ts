import type { FastifyRequest, FastifyReply } from 'fastify'

import { AUTH_COOKIE_NAME } from '../config/auth-cookie'

interface AuthTokenPayload {
  sub: string
}

export async function Authenticate(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[AUTH_COOKIE_NAME]

  if(!token) {
    return reply.status(401).send({
      message: "Unauthorized"
    })
  }

  try {
    const payload = request.server.jwt.verify<AuthTokenPayload>(token)
    request.user ={ id: payload.sub }
  } catch (error) {
    return reply.status(401).send({
      message: `${error} Unauthorized`
    })
  }
}