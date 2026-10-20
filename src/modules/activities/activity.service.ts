import { prisma } from '../../database/prisma.js'

import { CreateActivityInput } from './activity.schema.js'

import { format, startOfWeek, subWeeks } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

const TIME_ZONE = 'America/Sao_Paulo'

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

export async function GetActivitiesCount(userId: string) {
  return prisma.activity.count({
    where: {
      userId
    }
  })
}

export async function GetActivitiesStreak(userId: string ) {
  const now = toZonedTime(new Date(), TIME_ZONE)

  function GetWeekKey(date: Date): string {
    return format(
      startOfWeek(date, { weekStartsOn: 1}),
      'yyyy-MM-dd'
    )
  }

  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1})

  const [ totalActivities, activities ] = await Promise.all([
    GetActivitiesCount(userId),

    prisma.activity.findMany({
      where: { userId },
      select: { startedAt: true },
      orderBy: { startedAt: 'asc' }
    })
  ])

  const weekCounts = new Map<string, number>()

  for(const activity of activities) {
    const localStartedAt = toZonedTime(
      activity.startedAt,
      TIME_ZONE
    )

    const weekKey = GetWeekKey(localStartedAt)

    weekCounts.set(
      weekKey, (weekCounts.get(weekKey) ?? 0) + 1
    )
  }

  const currentWeekKey = GetWeekKey(currentWeekStart)
  const activitiesThisWeek = weekCounts.get(currentWeekKey) ?? 0

  const weeklyLevel = activitiesThisWeek === 0
    ? null
    : activitiesThisWeek === 1
      ? 'bronze'
      : activitiesThisWeek <= 3
        ? 'silver'
        : 'gold'

  let weekToCheck = activitiesThisWeek > 0 ? currentWeekStart : subWeeks(currentWeekStart, 1)
  let weeklyStreak =  0

  while(true) {
    const weekKey = GetWeekKey(weekToCheck)

    if(!weekCounts.has(weekKey)) {
      break
    }

    weeklyStreak += 1
    weekToCheck = subWeeks(weekToCheck, 1)
  }

  return {
    totalActivities,
    activitiesThisWeek,
    weeklyStreak,
    weeklyLevel
  }
}