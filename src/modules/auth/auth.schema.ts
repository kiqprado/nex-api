import { z } from 'zod' 

export const PassWordSchema = z.string()
  .min(7, "Password must have at least 7 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
  .max(108, "Password is too long")


export const RegisterUserSchema = z.object({
  email: z.email("Invalid Email").optional(),
  phone: z.string().min(10, "Invalid Phone").max(20, "Invalid Phone").optional(),
  password: PassWordSchema
}).refine(data => data.email || data.phone, { message: "Email or Phone is Required"})


export const LoginUserSchema = z.object({
  identifier: z.string().trim().min(1, "User is required"),
  password: z.string().min(1, "Password is required")
})

export const CompleteProfileSchema = z.object({
  name: z.string().trim()
  .min(2, "Name must have at least 2 characters")
  .max(80, "Name is too long"),
  username: z.string().trim().toLowerCase()
  .min(3, "Username must have at least 3 characters")
  .max(30, "Username is too long")
  .regex(/^[a-z0-9._]+$/, "Username can only contain letters, numbers, dots and underscores"),
  city: z.string().trim()
  .min(2, "City must have at least 2 characters")
  .max(100, "City is too long."),
  state: z.string().trim().toUpperCase().length(2, "State must have 2 characters"),
  country: z.string().trim().toUpperCase().length(2, "Country must have 2 characters"),
  bio: z.string().trim().max(160, "Bio must have at most 160 characters.").optional()
})

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>

export type LoginUserInput = z.infer<typeof LoginUserSchema>

export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>
