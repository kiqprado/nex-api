
import type { CookieSerializeOptions } from '@fastify/cookie'

const isProduction = process.env.NODE_ENV === 'production'

export const AUTH_COOKIE_NAME = "nex_session"

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export const AUTH_COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction ? "none" : "lax",

  path: "/",

  maxAge: AUTH_COOKIE_MAX_AGE
}