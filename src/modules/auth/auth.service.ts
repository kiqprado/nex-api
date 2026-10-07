import argon2 from 'argon2'

import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../database/prisma.js'

import { LoginUserInput, RegisterUserInput, CompleteProfileInput  } from './auth.schema.js'

export async function RegisterUser(data: RegisterUserInput) {
  const email = data.email?.trim().toLowerCase() ?? null
  const phone = data.phone?.trim() ?? null

  if(email) {
    const emailAlreadyExists = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if(emailAlreadyExists) {
      throw new Error("EMAIL_ALREADY_EXISTS")
    }
  }

  if(phone) {
    const phoneAlreadyExists = await prisma.user.findUnique({
      where: {
        phone
      }
    })

    if(phoneAlreadyExists) {
      throw new Error("PHONE_ALREADY_REGISTERED")
    }
  }

  const passwordHash = await argon2.hash(data.password, {type: argon2.argon2id})

  return prisma.user.create({
    data: {
      email,
      phone,
      passwordHash
    },
    select: {
      id: true,

      name: true,
      username: true,

      email: true,
      phone: true,

      avatarUrl: true,
      bio: true,

      city: true,
      state: true,
      country: true,

      createdAt: true,
      updatedAt: true
    }
  })
}

export async function AuthenticateUser(data: LoginUserInput) {
  const identifier = data.identifier.trim().toLowerCase()

  const user = await prisma.user.findFirst({
    where: {
      OR:[{email: identifier}, {phone: data.identifier.trim()}, {username: identifier}]
    }
  })

  if(!user) {
    return null
  }

  const passwordMatches = await argon2.verify(user.passwordHash, data.password)

  if(!passwordMatches) {
    return null
  }

  return {
    id: user.id,

    name: user.name,
    username: user.username,

    email: user.email,
    phone: user.phone,

    avatarUrl: user.avatarUrl,
    bio: user.bio,

    city: user.city,
    state: user.state,
    country: user.country
  }
}

export async function GetAuthenticatedUser(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId
    },

    select: {
      id: true,

      name: true,
      username: true,

      email: true,
      phone: true,

      avatarUrl: true,
      bio: true,

      city: true,
      state: true,
      country: true
    }
  })
}

export async function CompleteProfileUser(userId: string, data: CompleteProfileInput) {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        name: data.name,
        username: data.username,

        city: data.city,
        state: data.state,
        country: data.country,

        bio: data.bio || null
      },
      select: {
        id: true,

        name: true,
        username: true,
        
        email: true,
        phone: true,

        avatarUrl: true,
        bio: true,

        city: true,
        state: true,
        country: true
      }
    })

    return { user, usernameConflict: false}
  } catch (error) {
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        user: null,
        usernameConflict: true
      }
    }
    throw error
  } 
}