import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const CreateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long').max(50),
  email: z.string().email('Please provide a valid email address.'),
  password: z
    .string()
    .min(10, { message: 'Password must be at least 10 characters long' })
    .max(100, { message: 'Password cannot be longer than 100 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  client_id: z.string().min(1, 'Client ID is required.'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
