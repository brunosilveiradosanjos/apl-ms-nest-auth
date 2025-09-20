import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'

import { UserService } from './application/services/user.service'
import { UserModel } from './infrastructure/persistence/sequelize/models/user.model'
import { IUsersRepository } from './domain/repositories/i-users.repository'
import { SequelizeUsersRepository } from './infrastructure/persistence/sequelize/repositories/sequelize-users.repository'
import { IHashProvider } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider'
import { BcryptHashProvider } from '@/modules/auth/infrastructure/providers/hash/bcrypt-hash.provider'
import { UsersController } from './infrastructure/http/controllers/users.controller'

@Module({
  imports: [SequelizeModule.forFeature([UserModel]), JwtModule.register({}), ConfigModule],
  controllers: [UsersController],
  providers: [
    UserService,
    {
      provide: IUsersRepository,
      useClass: SequelizeUsersRepository,
    },
    {
      provide: IHashProvider,
      useClass: BcryptHashProvider,
    },
  ],
})
export class UserModule {}
