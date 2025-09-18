import { Test, TestingModule } from '@nestjs/testing'
import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { ZodValidationPipe } from 'nestjs-zod'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { ConfigModule, ConfigService } from '@nestjs/config'

describe('UsersController (e2e)', () => {
  let app: INestApplication
  let pgClient: Client
  let schema: string
  const API_PREFIX = '/api/v1'

  beforeEach(async () => {
    schema = `test_${generateUniqueId().replace(/-/g, '_')}`
    process.env.POSTGRES_SCHEMA = schema

    // Create a lightweight module just to get an initialized ConfigService
    const configModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: ['.env'] })],
      providers: [ConfigService],
    }).compile()
    const configService = configModule.get<ConfigService>(ConfigService)

    // This now works because dotenv has loaded the .env file
    pgClient = new Client({
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      user: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
    })

    console.log('PostgreSQL host:', pgClient.host)
    console.log('PostgreSQL port:', pgClient.port)
    console.log('PostgreSQL user:', pgClient.user)
    console.log('PostgreSQL password:', pgClient.password)
    console.log('PostgreSQL database:', pgClient.database)

    await pgClient.connect()
    await pgClient.query(`CREATE SCHEMA "${schema}"`)
    const initSql = fs.readFileSync(path.join(__dirname, '../db/init.sql'), 'utf-8')
    await pgClient.query(`SET search_path TO "${schema}";\n${initSql}`)

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix(API_PREFIX)
    app.useGlobalPipes(new ZodValidationPipe())
    await app.init()
  })

  afterEach(async () => {
    if (app) await app.close()
    if (pgClient) {
      await pgClient.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      await pgClient.end()
    }
    delete process.env.POSTGRES_SCHEMA
  })

  describe('/users (POST)', () => {
    const timestamp = Date.now()
    const newUser = {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'strongPassword123',
      firstName: 'Test',
      lastName: 'User',
    }

    it('should create a new user with all fields and return tokens', async () => {
      const res = await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(201)

      expect(res.body).toHaveProperty('access_token')
      expect(res.body).toHaveProperty('refresh_token')
    })

    it('should fail with 409 Conflict if the username already exists', async () => {
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(201)
      const duplicateUsernameUser = { ...newUser, email: `another_${timestamp}@example.com` }
      return request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(duplicateUsernameUser).expect(409)
    })

    it('should fail with 409 Conflict if the email already exists', async () => {
      await request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(newUser).expect(201)
      const duplicateEmailUser = { ...newUser, username: `another_${timestamp}` }
      return request(app.getHttpServer()).post(`${API_PREFIX}/users`).send(duplicateEmailUser).expect(409)
    })

    it('should fail with 400 Bad Request if the password is too short', async () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/users`)
        .send({ username: `anotheruser_${Date.now()}`, email: `short_${Date.now()}@example.com`, password: '123' })
        .expect(400)
    })
  })
})
