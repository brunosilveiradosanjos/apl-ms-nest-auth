import { registerAs } from '@nestjs/config'
import { z } from 'zod'

import { Dialect } from 'sequelize'
import { RefreshTokenModel } from '@/modules/auth/infrastructure/persistence/sequelize/models/refresh-token.model'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'

const dbConfigSchema = z.object({
  DB_DIALECT: z.string().default('postgres'),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  POSTGRES_SCHEMA: z.string().optional(),
})

export const databaseConfig = registerAs('database', () => {
  const validatedConfig = dbConfigSchema.parse(process.env)
  return {
    dialect: validatedConfig.DB_DIALECT as Dialect,
    host: validatedConfig.DB_HOST,
    port: validatedConfig.DB_PORT,
    username: validatedConfig.DB_USERNAME,
    password: validatedConfig.DB_PASSWORD,
    database: validatedConfig.DB_DATABASE,
    models: [UserModel, RefreshTokenModel],
    autoLoadModels: true,
    synchronize: false, // Never use true in production
    schema: validatedConfig.POSTGRES_SCHEMA,
  }
})
