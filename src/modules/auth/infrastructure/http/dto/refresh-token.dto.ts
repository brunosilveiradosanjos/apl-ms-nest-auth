import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
