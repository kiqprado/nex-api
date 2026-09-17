import { FastifyInstance } from 'fastify'
import {z} from 'zod'

import { CreateActivitySchema } from './activity.schema'
import { CreateActivity, GetActivities, GetActivityById } from './activity.service'

const ActivityParamsSchema = z.object({id: z.uuid()})

export async function ActivityRoutes(app: FastifyInstance) {
  const userId = '7b91c34b-7bd9-4ab4-bc3e-c0ef3ccc0e48'

  app.post('/activities', async(request, reply) => {
    const input = CreateActivitySchema.parse(request.body)

    const activity = await CreateActivity(userId, input)

    return reply.status(201).send(activity)
  })

  app.get('/activities', async(_request, reply) => {
    const activities = await GetActivities(userId)

    return reply.status(200).send(activities)
  })

  app.get('/activities/:id', async(request, reply) => {
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
