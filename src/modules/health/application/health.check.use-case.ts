import { Inject, Injectable } from '@nestjs/common'
import { HealthIndicator } from '../domain/health.indicator'

export interface OverallHealthStatus {
  status: 'ok' | 'error'
  info: Record<string, 'up' | 'down'>
  details: Record<string, string | undefined>
  timestamp: string
}

@Injectable()
export class HealthCheckUseCase {
  constructor(
    @Inject('HealthIndicators')
    private readonly indicators: HealthIndicator[],
  ) {}

  async execute(): Promise<OverallHealthStatus> {
    const results = await Promise.all(this.indicators.map((i) => i.check()))

    const isHealthy = results.every((res) => res.status === 'up')
    const info: Record<string, 'up' | 'down'> = {}
    const details: Record<string, string | undefined> = {}

    results.forEach((res) => {
      info[res.name] = res.status
      if (res.status === 'down') {
        details[res.name] = res.error
      }
    })

    return {
      status: isHealthy ? 'ok' : 'error',
      info,
      details,
      timestamp: new Date().toISOString(),
    }
  }
}
