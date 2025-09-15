import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const TokenRequestSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
})

export class TokenRequestDto extends createZodDto(TokenRequestSchema) {}
