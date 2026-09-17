import { z }  from 'zod'

export const ActivityPointSchema = z.object({
  longitude: z.number(),
  latitude: z.number(),

  altitude: z.number().nullable(),
  accuracy: z.number().nonnegative(),
  altitudeAccuracy: z.number().nullable(),

  speed: z.number().nullable(),
  heading: z.number().nullable(),

  timestamp: z.number().int().positive()
})

export const CreateActivitySchema = z.object({
  id: z.uuid(),

  startedAt: z.coerce.date(),
  finishedAt: z.coerce.date(),

  totalDuration: z.number().nonnegative(),
  activeDuration: z.number().nonnegative(),
  distance: z.number().nonnegative(),

  averagePace: z.number().nonnegative(),
  averageActivePace: z.number().nonnegative(),

  averageSpeed: z.number().nonnegative(),
  maxSpeed: z.number().nonnegative(),
  minSpeed: z.number().nonnegative(),

  calories: z.number().nonnegative(),
  elevationGain: z.number().nonnegative(),
  steps: z.number().int().nonnegative(),

  category: z.enum([
    "running",
    "walking",
    "hiking",
  ]),

  path: z.array(ActivityPointSchema),
  mapSnapshot: z.string().nullable(),
})

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>