import argon2 from 'argon2'

import { prisma } from '../../database/prisma'

import { LoginUserInput, RegisterUserInput  } from './auth.schema'

export async function RegisterUser(data: RegisterUserInput) {
  const email = data.email?.trim().toLocaleLowerCase() ?? null
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
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function AuthenticateUser(data: LoginUserInput) {
  const identifier = data.identifier.trim().toLocaleLowerCase()

  const user = await prisma.user.findFirst({
    where: {
      OR:[{email: identifier}, {phone: data.identifier.trim()}, {username: identifier}]
    }
  })

  if(!user) {
    return null
  }

  const PasswordMatches = await argon2.verify(user.passwordHash, data.password)

  if(!PasswordMatches) {
    return null
  }

  return user
}