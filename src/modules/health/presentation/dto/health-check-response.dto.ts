import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ApiProperty } from '@nestjs/swagger'

const HealthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'error']).describe('Overall status of the service.'),
  info: z.record(z.string(), z.enum(['up', 'down'])).describe('Status of individual dependencies.'),
  details: z.record(z.string(), z.string().optional()).describe('Error details for dependencies that are down.'),
  timestamp: z.string().datetime().describe('The UTC timestamp of the health check.'),
})

export class HealthCheckResponseDto extends createZodDto(HealthCheckResponseSchema) {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status: 'ok' | 'error'

  @ApiProperty({ example: { database: 'up' } })
  info: Record<string, 'up' | 'down'>

  @ApiProperty({ example: { database: 'Connection refused' } })
  details: Record<string, string | undefined>

  @ApiProperty({ example: '2025-09-18T18:57:55.000Z' })
  timestamp: string
}
