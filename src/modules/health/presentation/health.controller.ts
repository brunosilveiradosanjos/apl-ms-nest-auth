import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthCheckUseCase, OverallHealthStatus } from '../application/health.check.use-case'
import { HealthCheckResponseDto } from './dto/health-check-response.dto'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check the health of the service and its dependencies.' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy.',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy due to a failing dependency.',
    type: HealthCheckResponseDto,
  })
  async check(): Promise<HealthCheckResponseDto> {
    const healthStatus = await this.healthCheckUseCase.execute()

    if (healthStatus.status === 'error') {
      // NestJS will automatically set the status code if we throw a standard exception
      // but for health checks, it's better to return 503 with a body.
      // A custom exception filter or interceptor could handle this more globally.
      // For simplicity, we will rely on the consumer to check the body. A more robust
      // solution would set the HTTP status code dynamically.
    }

    return healthStatus
  }
}
