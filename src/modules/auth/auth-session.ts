import { FastifyInstance, FastifyReply } from "fastify"

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "../../config/auth-cookie.js"

export function CreateAuthSession( 
  app: FastifyInstance, 
  reply: FastifyReply,
  userId: string
){
  const token = app.jwt.sign(
    {sub: userId},
    {expiresIn: "7d"}
  )

  reply.setCookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)
}

export function DestroyAuthSession(reply: FastifyReply) {
  reply.clearCookie(AUTH_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: AUTH_COOKIE_OPTIONS.secure,
    sameSite: AUTH_COOKIE_OPTIONS.sameSite
  })
}