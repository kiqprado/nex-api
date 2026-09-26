import { FastifyInstance } from 'fastify'
import {z} from 'zod'

import { Authenticate } from '../../plugins/authenticate'

import { CreateActivitySchema } from './activity.schema'
import { CreateActivity, GetActivities, GetActivityById } from './activity.service'

const ActivityParamsSchema = z.object({id: z.uuid()})

export async function ActivityRoutes(app: FastifyInstance) {

  app.post('/activities', { preHandler: Authenticate }, async(request, reply) => {
    const userId = request.user.id
    const input = CreateActivitySchema.parse(request.body)

    const activity = await CreateActivity(userId, input)

    return reply.status(201).send(activity)
  })

  app.get('/activities',{ preHandler: Authenticate }, async(request, reply) => {
    const userId = request.user.id
    const activities = await GetActivities(userId)

    return reply.status(200).send(activities)
  })

  app.get('/activities/:id',{ preHandler: Authenticate }, async(request, reply) => {
    const userId = request.user.id
    const {id} = ActivityParamsSchema.parse(request.params)

    const activity = await GetActivityById(userId, id)
    
    if(!activity) {
      return reply.status(404).send({
        message: "Activity can`t not be found."
      })
    }

    return reply.status(200).send(activity)
  })
}
