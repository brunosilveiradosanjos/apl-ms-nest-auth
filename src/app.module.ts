import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ZodValidationPipe } from 'nestjs-zod'
import { APP_PIPE } from '@nestjs/core'
import { RateLimiterModule, RateLimiterGuard } from 'nestjs-rate-limiter'
import { APP_GUARD } from '@nestjs/core'

import { appConfig } from '@/shared/config/app.config'
import { DatabaseModule } from '@/shared/database/database.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { HealthModule } from '@/modules/health/health.module'
import { UserModule } from '@/modules/user/user.module'
import { ClientModule } from './modules/client/client.module'
import { HashModule } from './modules/auth/hash.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [appConfig],
    }),
    RateLimiterModule.register({
      for: 'Express',
      type: 'Memory',
      points: 5,
      duration: 60,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    HealthModule,
    ClientModule,
    HashModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
