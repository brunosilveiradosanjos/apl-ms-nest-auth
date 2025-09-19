// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'
import { ZodValidationPipe } from 'nestjs-zod' // Import the Zod pipe

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ZodValidationPipe()) // Use the correct Zod pipe
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT')

  app.setGlobalPrefix('api/v1')

  // Patch Swagger to support Zod DTOs
  patchNestJsSwagger()

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Microservice')
    .setDescription('API documentation for the Authentication Microservice')
    .setVersion('1.0')
    .addTag('Authentication')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  // Tell the app to listen on all network interfaces
  await app.listen(port as string | number, '0.0.0.0')
  console.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap the application:', err)
  process.exit(1)
})
