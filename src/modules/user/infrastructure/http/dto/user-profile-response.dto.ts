import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { User } from '@/modules/user/domain/entities/user.entity'

// Zod schema defines the public shape of a user profile.
// We use camelCase for API consistency.
const UserProfileResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  isActive: z.boolean(),
  is_verified: z.boolean(),
  lastLogin: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
})

// The DTO class is now cleanly derived from the schema.
export class UserProfileResponseDto extends createZodDto(UserProfileResponseSchema) {
  // A constructor can be added for convenient mapping from the entity.
  constructor(user: User) {
    super()
    this.id = user.id
    this.username = user.username
    this.email = user.email
    this.firstName = user.first_name || null
    this.lastName = user.last_name || null
    this.isActive = user.is_active
    this.is_verified = user.is_verified
    this.lastLogin = user.last_login || null
    this.createdAt = user.created_at || null
    this.updatedAt = user.last_login || null
  }
}
