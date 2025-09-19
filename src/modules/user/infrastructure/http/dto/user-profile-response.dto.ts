import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Schema defines the public shape of a user profile.
// Note: We use camelCase for API consistency, even if the DB is snake_case.
const UserProfileResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  isActive: z.boolean(),
})

// The DTO class is now cleanly derived from the schema.
export class UserProfileResponseDto extends createZodDto(UserProfileResponseSchema) {}
