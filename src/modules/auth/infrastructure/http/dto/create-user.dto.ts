// src/modules/auth/infrastructure/http/dto/create-user.dto.ts
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const CreateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long.')
    .max(50, 'Username cannot be longer than 50 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(100, 'Password cannot be longer than 100 characters.'),
})

// The DTO class is derived from the Zod schema
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
