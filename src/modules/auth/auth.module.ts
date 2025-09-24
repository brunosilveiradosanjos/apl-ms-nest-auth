// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'

import { AuthController } from './infrastructure/http/controllers/auth.controller'
import { AuthService } from './application/services/auth.service'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'
import { RefreshTokenModel } from './infrastructure/persistence/sequelize/models/refresh-token.model'
import { IRefreshTokensRepository } from './domain/repositories/i-refresh-tokens.repository'
import { SequelizeRefreshTokensRepository } from './infrastructure/persistence/sequelize/repositories/sequelize-refresh-tokens.repository'
import { AuthCleanupService } from './application/services/auth-cleanup.service'
import { JwtStrategy } from './infrastructure/http/strategies/jwt.strategy'
import { HashModule } from './hash.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, RefreshTokenModel]),
    JwtModule.register({}),
    ConfigModule,
    UserModule,
    HashModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCleanupService,
    JwtStrategy,
    {
      provide: IRefreshTokensRepository,
      useClass: SequelizeRefreshTokensRepository,
    },
  ],
})
export class AuthModule {}
