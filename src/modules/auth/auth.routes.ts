import { FastifyInstance } from 'fastify'

import { prisma } from '../../database/prisma'

import { Authenticate } from '../../plugins/authenticate'

import { CreateAuthSession, DestroyAuthSession } from './auth-session'
import { LoginUserSchema, RegisterUserSchema} from './auth.schema'
import { AuthenticateUser, RegisterUser } from './auth.service'

export async function AuthRoutes(app: FastifyInstance) {
  app.post("/auth/register", async( request, reply) => {
    const parsedBody = RegisterUserSchema.safeParse(request.body)

    if(!parsedBody.success) {
      return reply.status(400).send({
        message: "Invalid request",
        issues: parsedBody.error.issues
      })
    }

    try{
      const user = await RegisterUser(parsedBody.data)

      CreateAuthSession(app, reply, user.id)

      return reply.status(201).send({
        user
      })
    } catch(error) {
      if(error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        return reply.status(400).send({
          message: "Este Email ja está em uso."
        })
      }

      if(error instanceof Error && error.message === "PHONE_ALREADY_REGISTERED") {
        return reply.status(400).send({
          message: "Este numero de Telefone já está em uso."
        })
      }

      throw error
    }
  })

  app.post("/auth/login", async (request, reply) => {
    const parsedBody = LoginUserSchema.safeParse(request.body)

    if(!parsedBody.success) {
      return reply.status(400).send({
        message: "Invalid Rquest",
        issues: parsedBody.error.issues
      })
    }

    const user = await AuthenticateUser(parsedBody.data)

    if(!user) {
      return reply.status(401).send({
        message: "Invalid credentials"
      })
    }

    CreateAuthSession(app, reply, user.id)

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      }
    })
  })

  app.post("/auth/logout", { preHandler: Authenticate }, async(_request, reply) => {
    DestroyAuthSession(reply)

    return reply.status(204).send()
  })

  app.get("/auth/me", { preHandler: Authenticate }, async(request, reply) => {
    const user = await prisma.user.findUnique({
      where: {
        id: request.user.id
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        avatarUrl: true
      }
    })

    if(!user) {
      return reply.status(401).send({
        message: "Unauthorized"
      })
    }

    return reply.send({ user })
  })
}