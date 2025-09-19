import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Schema defines the fields a user is allowed to update.
const UpdateUserProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
})

export class UpdateUserProfileDto extends createZodDto(UpdateUserProfileSchema) {}
