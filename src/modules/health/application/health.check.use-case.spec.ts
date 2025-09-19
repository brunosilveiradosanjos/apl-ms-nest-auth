import { HealthIndicator, HealthResult } from '../domain/health.indicator'
import { HealthCheckUseCase } from './health.check.use-case'

class MockHealthIndicator extends HealthIndicator {
  public check = jest.fn()
  constructor(result: HealthResult) {
    super()
    this.check.mockResolvedValue(result)
  }
}

describe('HealthCheckUseCase', () => {
  it('should return "ok" when all indicators are "up"', async () => {
    const dbIndicator = new MockHealthIndicator({ name: 'database', status: 'up' })
    const cacheIndicator = new MockHealthIndicator({ name: 'cache', status: 'up' })
    const useCase = new HealthCheckUseCase([dbIndicator, cacheIndicator])

    const result = await useCase.execute()

    expect(result.status).toBe('ok')
    expect(result.info).toEqual({ database: 'up', cache: 'up' })
    expect(Object.keys(result.details).length).toBe(0)
  })

  it('should return "error" if any indicator is "down"', async () => {
    const dbIndicator = new MockHealthIndicator({ name: 'database', status: 'up' })
    const cacheIndicator = new MockHealthIndicator({ name: 'cache', status: 'down', error: 'Cache unavailable' })
    const useCase = new HealthCheckUseCase([dbIndicator, cacheIndicator])

    const result = await useCase.execute()

    expect(result.status).toBe('error')
    expect(result.info).toEqual({ database: 'up', cache: 'down' })
    expect(result.details).toEqual({ cache: 'Cache unavailable' })
  })
})
