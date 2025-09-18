import { z } from 'zod'

/**
 * Defines the schema for all environment variables using Zod.
 * This ensures that the application has the required configuration to run.
 */
export const appConfigSchema = z.object({
  // --- THIS IS THE FIX ---
  // Add 'test' to the list of valid NODE_ENV values.
  NODE_ENV: z
    .union([z.enum(['development', 'homologation', 'production', 'ci', 'test']), z.string().regex(/^test_\d+$/)])
    .default('development'),
  // -------------------------

  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string(),
})

/**
 * This function loads and validates the environment variables against the schema.
 * If validation fails, it throws a descriptive error.
 */
export const appConfig = () => {
  const result = appConfigSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables. Check your .env file or deployment configuration.')
  }

  return result.data
}
