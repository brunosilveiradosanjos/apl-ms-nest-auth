import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { INestApplication, HttpStatus } from '@nestjs/common' // Import HttpStatus
import { HealthController } from './health.controller'
import { HealthCheckUseCase } from '@/modules/health/application/health.check.use-case'

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

  it('/health (GET) - should return 200 and healthy status', async () => {
    const healthyResponse = {
      status: 'ok',
      info: { database: 'up' },
      details: {},
      timestamp: new Date().toISOString(),
    }
    mockHealthCheckUseCase.execute.mockResolvedValue(healthyResponse)

    // Make the test more robust by checking the body content separately
    const res = await request(app.getHttpServer()).get('/health').expect(HttpStatus.OK) // Use HttpStatus for readability

    expect(res.body.status).toEqual(healthyResponse.status)
    expect(res.body.info).toEqual(healthyResponse.info)
    expect(res.body).toHaveProperty('timestamp')
  })

  it('/health (GET) - should return 503 and unhealthy status', async () => {
    const unhealthyResponse = {
      status: 'error',
      info: { database: 'down' },
      details: { database: 'Connection error' },
      timestamp: new Date().toISOString(),
    }
    mockHealthCheckUseCase.execute.mockResolvedValue(unhealthyResponse)

    const res = await request(app.getHttpServer()).get('/health').expect(HttpStatus.SERVICE_UNAVAILABLE) // ✅ FIX: The expected status is now 503

    // Check the body to ensure the correct error details are returned
    expect(res.body.status).toEqual(unhealthyResponse.status)
    expect(res.body.info).toEqual(unhealthyResponse.info)
    expect(res.body.details).toEqual(unhealthyResponse.details)
    expect(res.body).toHaveProperty('timestamp')
  })
})
