// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'

import { AuthController } from './infrastructure/http/controllers/auth.controller'
import { AuthService } from './application/services/auth.service'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'
import { RefreshTokenModel } from './infrastructure/persistence/sequelize/models/refresh-token.model'
import { IUsersRepository } from '@/modules/user/domain/repositories/i-users.repository'
import { SequelizeUsersRepository } from '@/modules/user/infrastructure/persistence/sequelize/repositories/sequelize-users.repository'
import { IRefreshTokensRepository } from './domain/repositories/i-refresh-tokens.repository'
import { SequelizeRefreshTokensRepository } from './infrastructure/persistence/sequelize/repositories/sequelize-refresh-tokens.repository'
import { AuthCleanupService } from './application/services/auth-cleanup.service'
import { IHashProvider } from './infrastructure/providers/hash/i-hash.provider'
import { BcryptHashProvider } from './infrastructure/providers/hash/bcrypt-hash.provider'

@Module({
  imports: [SequelizeModule.forFeature([UserModel, RefreshTokenModel]), JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCleanupService,
    {
      provide: IUsersRepository,
      useClass: SequelizeUsersRepository,
    },
    {
      provide: IRefreshTokensRepository,
      useClass: SequelizeRefreshTokensRepository,
    },
    {
      provide: IHashProvider,
      useClass: BcryptHashProvider,
    },
  ],
})
export class AuthModule {}
