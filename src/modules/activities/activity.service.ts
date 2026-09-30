import { prisma } from '../../database/prisma.js'
import { CreateActivityInput } from './activity.schema.js'

export async function CreateActivity(userId: string, input: CreateActivityInput) {
  const sport = await prisma.sport.findUnique({
    where: {
      slug: input.category
    }
  })

  if(!sport) {
    throw new Error("Sport not Found!")
  }

  const activity = await prisma.$transaction(async(tx) => {
    const createdActivity = await tx.activity.create({
      data: {
        id: input.id,
        userId,
        sportId: sport.id,

        startedAt: input.startedAt,
        finishedAt: input.finishedAt,

        totalDuration: input.totalDuration,
        activeDuration: input.activeDuration,
        distance:  input.distance,

        averagePace: input.averagePace,
        averageActivePace: input.averageActivePace,

        averageSpeed: input.averageSpeed,
        maxSpeed: input.maxSpeed,
        minSpeed: input.minSpeed,

        calories: input.calories,
        elevationGain: input.elevationGain,
        steps: input.steps,

        mapSnapshotUrl: null
      }
    })

    if(input.path.length > 0) {
      await tx.activityPoint.createMany({
        data: input.path.map(point => ({
          activityId: createdActivity.id,

          latitude: point.latitude,
          longitude: point.longitude,

          altitude: point.altitude,
          accuracy: point.accuracy,
          altitudeAccuracy: point.altitudeAccuracy,

          speed: point.speed,
          heading: point.heading,

          timestamp: new Date(point.timestamp)
        }))
      })
    }

    return createdActivity
  })

  return activity
}

export async function GetActivities(userId: string) {
  return prisma.activity.findMany({
    where: {
      userId
    },
    orderBy: {
      startedAt: 'asc'
    },
    include: {
      sport: true
    }
  })
}

export async function GetActivityById(userId: string, activityId: string) {
  return prisma.activity.findFirst({
    where: {
      id: activityId,
      userId
    },
    include: {
      sport: true,
      points: {
        orderBy: {
          timestamp: 'asc'
        }
      }
    }
  })
}