import { Module } from '@nestjs/common'
import { HealthController } from './presentation/health.controller'
import { HealthCheckUseCase } from './application/health.check.use-case'
import { DatabaseHealthIndicator } from './infrastructure/database.health.indicator'

@Module({
  controllers: [HealthController],
  providers: [
    HealthCheckUseCase,
    DatabaseHealthIndicator,
    {
      provide: 'HealthIndicators',
      useFactory: (dbIndicator: DatabaseHealthIndicator) => [dbIndicator],
      inject: [DatabaseHealthIndicator],
    },
  ],
})
export class HealthModule {}
