import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(8).max(100),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
