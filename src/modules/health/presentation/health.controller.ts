import { Controller, Get, HttpStatus, Res } from '@nestjs/common' // Import Response
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthCheckUseCase } from '@/modules/health/application/health.check.use-case'
import { HealthCheckResponseDto } from './dto/health-check-response.dto'
import express from 'express' // Import Express Response type

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Get()
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
  async check(@Res() res: express.Response): Promise<void> {
    // Inject Response object
    const healthStatus = await this.healthCheckUseCase.execute()

    if (healthStatus.status === 'error') {
      // Set the status code to 503 and send the response body
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json(healthStatus)
    } else {
      // Otherwise, send a 200 OK
      res.status(HttpStatus.OK).json(healthStatus)
    }
  }
}
