import { Test, TestingModule } from '@nestjs/testing'
import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { ZodValidationPipe } from 'nestjs-zod'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { ConfigService } from '@nestjs/config'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  let pgClient: Client
  let schema: string
  const API_PREFIX = '/api/v1'

  // --- REMOVED beforeAll and afterAll ---

  beforeEach(async () => {
    // 1. Generate a unique schema name for this test
    schema = `test_${generateUniqueId().replace(/-/g, '_')}`

    // 2. Set the environment variable so NestJS connects to our new schema
    process.env.POSTGRES_SCHEMA = schema

    // 3. Connect to the database with a raw client to manage the schema
    const configService = new ConfigService()
    pgClient = new Client({
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      user: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
    })
    await pgClient.connect()

    // 4. Create the schema and load the init script into it
    await pgClient.query(`CREATE SCHEMA "${schema}"`)
    const initSql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf-8')
    await pgClient.query(`SET search_path TO "${schema}";\n${initSql}`)

    // 5. Now, bootstrap the NestJS application for the test
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
    if (app) {
      await app.close()
    }
    if (pgClient) {
      await pgClient.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      await pgClient.end()
    }
    delete process.env.POSTGRES_SCHEMA
  })

  describe('/users (POST)', () => {
    it('should create a new user and return tokens', async () => {
      const newUser = {
        username: `testuser_${Date.now()}`,
        password: 'strongPassword123',
      }

      const res = await request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send(newUser)
        .expect(201)

      expect(res.body).toHaveProperty('access_token')
      expect(res.body).toHaveProperty('refresh_token')
    })

    it('should fail with 409 Conflict if the username already exists', async () => {
      const newUser = {
        username: `testuser_${Date.now()}`,
        password: 'strongPassword123',
      }
      // First, create the user
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(201)

      // Then, try to create it again
      return request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(409)
    })

    it('should fail with 400 Bad Request if the password is too short', async () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send({ username: `anotheruser_${Date.now()}`, password: '123' })
        .expect(400)
    })
  })
})
