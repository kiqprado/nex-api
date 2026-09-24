import { FastifyInstance } from 'fastify'

import { LoginUserSchema, RegisterUserSchema} from '../auth/auth.schema'
import { AuthenticateUser, RegisterUser } from '../auth/auth.service'
import { privateDecrypt } from 'node:crypto'

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
      const token = app.jwt.sign({
        sub: user.id
      })

      return reply.status(200).send({
        user,
        token
      })
    }catch(error){
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

    const token = app.jwt.sign({
      sub: user.id
    })

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      },
      token
    })
  })
}