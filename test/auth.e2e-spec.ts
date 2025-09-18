import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { ZodValidationPipe } from 'nestjs-zod'
import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { TokenRequestDto } from '@/modules/auth/infrastructure/http/dto/token-request.dto'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let pgClient: Client
  let schema: string

  const API_PREFIX = '/api/v1'

  beforeEach(async () => {
    schema = `test_${generateUniqueId().replace(/-/g, '_')}`
    process.env.POSTGRES_SCHEMA = schema

    // This setup now correctly reads credentials from process.env, which is
    // populated by either the local .env file or the CI environment secrets.
    pgClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    })

    console.log('PostgreSQL host:', pgClient.host)
    console.log('PostgreSQL port:', pgClient.port)
    console.log('PostgreSQL user:', pgClient.user)
    console.log('PostgreSQL password:', pgClient.password)
    console.log('PostgreSQL database:', pgClient.database)

    await pgClient.connect()

    // 4. Create the schema and load the init script into it
    await pgClient.query(`CREATE SCHEMA "${schema}"`)
    const initSql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf-8')
    await pgClient.query(`SET search_path TO "${schema}";\n${initSql}`)

    // Bootstrap the NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix(API_PREFIX)
    app.useGlobalPipes(new ZodValidationPipe())
    await app.init()
  })

  afterEach(async () => {
    // 6. Clean up: close the app, drop the test schema, and disconnect the client
    // --- FIX: Add checks to prevent errors if setup failed ---
    if (app) {
      await app.close()
    }
    if (pgClient) {
      await pgClient.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      await pgClient.end()
    }

    delete process.env.POSTGRES_SCHEMA
  })

  // --- YOUR TESTS REMAIN THE SAME ---
  // They will now run in a completely isolated environment
  describe('/auth/token (POST)', () => {
    it('should fail with 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/token`)
        .send({ identifier: 'johndoe', password: 'wrongpassword' } as TokenRequestDto)
        .expect(401)
    })

    it('should return tokens for valid credentials', async () => {
      const timestamp = Date.now()
      const newUser = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'strongPassword123',
        firstName: 'Test',
        lastName: 'User',
      }

      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(201) // Expect HTTP 201 Created

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/token`)
        .send({ identifier: newUser.email, password: newUser.password } as TokenRequestDto)
        .expect(200)

      expect(res.body).toHaveProperty('access_token')
      expect(res.body).toHaveProperty('refresh_token')
    })
  })

  describe('/auth/refresh (POST)', () => {
    it('should return new tokens when given a valid refresh token', async () => {
      const timestamp = Date.now()
      const newUser = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'strongPassword123',
        firstName: 'Test',
        lastName: 'User',
      }
      const newUserRes = await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(201) // Expect HTTP 201 Created

      const { refresh_token } = newUserRes.body

      const refreshRes = await request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/refresh`)
        .send({ refreshToken: refresh_token })
        .expect(200)

      expect(refreshRes.body).toHaveProperty('access_token')
      expect(refreshRes.body).toHaveProperty('refresh_token')
    })
  })
})
