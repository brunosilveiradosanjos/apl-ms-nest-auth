import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest' // Removed the '* as'
import { INestApplication } from '@nestjs/common'
import { HealthController } from './health.controller' // CORRECTED PATH
import { HealthCheckUseCase } from '@/modules/health/application/health.check.use-case' // CORRECTED PATH

describe('HealthController (e2e)', () => {
  let app: INestApplication
  const mockHealthCheckUseCase = {
    execute: jest.fn(),
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckUseCase,
          useValue: mockHealthCheckUseCase,
        },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/health (GET) - should return 200 and healthy status', () => {
    const healthyResponse = {
      status: 'ok',
      info: { database: 'up' },
      details: {},
      timestamp: new Date().toISOString(),
    }
    mockHealthCheckUseCase.execute.mockResolvedValue(healthyResponse)

    return request(app.getHttpServer()).get('/health').expect(200).expect(healthyResponse)
  })

  it('/health (GET) - should return 200 (by default) and unhealthy status', () => {
    const unhealthyResponse = {
      status: 'error',
      info: { database: 'down' },
      details: { database: 'Connection error' },
      timestamp: new Date().toISOString(),
    }
    mockHealthCheckUseCase.execute.mockResolvedValue(unhealthyResponse)

    return request(app.getHttpServer())
      .get('/health')
      .expect(200) // Default NestJS behavior, consumer checks body status
      .expect(unhealthyResponse)
  })
})
