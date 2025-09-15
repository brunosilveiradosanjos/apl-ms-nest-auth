import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { ZodValidationPipe } from 'nestjs-zod' // Import the Zod pipe

describe('AuthController (e2e)', () => {
  let app: INestApplication
  const API_PREFIX = '/api/v1' // Define the prefix for clean tests

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix(API_PREFIX) // Also set the prefix in the test app instance
    app.useGlobalPipes(new ZodValidationPipe())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('/auth/token (POST)', () => {
    it('should fail with 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/token`)
        .send({ username: 'johndoe', password: 'wrongpassword' })
        .expect(401)
    })

    it('should return tokens for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/token`)
        .send({ username: 'johndoe', password: 'strongPassword123' })
        .expect(200)

      expect(res.body).toHaveProperty('access_token')
      expect(res.body).toHaveProperty('refresh_token')
    })
  })

  describe('/auth/refresh (POST)', () => {
    it('should return new tokens when given a valid refresh token', async () => {
      // 1. Login to get an initial refresh token
      const loginRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/token`)
        .send({ username: 'johndoe', password: 'strongPassword123' })

      const { refresh_token, access_token: old_access_token } = loginRes.body

      // 2. Use the refresh token to get new tokens
      const refreshRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/refresh`)
        .send({ refreshToken: refresh_token })
        .expect(200)

      expect(refreshRes.body).toHaveProperty('access_token')
      expect(refreshRes.body).toHaveProperty('refresh_token')
      // The new access token should be different from the old one
      expect(refreshRes.body.access_token).not.toEqual(old_access_token)
    })
  })
})
