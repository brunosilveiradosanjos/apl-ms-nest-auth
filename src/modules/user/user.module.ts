import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { PassportModule } from '@nestjs/passport'
import { UsersController } from './infrastructure/http/controllers/users.controller'
import { UserService } from './application/services/user.service'
import { SequelizeUsersRepository } from './infrastructure/persistence/sequelize/repositories/sequelize-users.repository'
import { IUsersRepository } from './domain/repositories/i-users.repository'
import { User } from './domain/entities/user.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([User]), // <-- This line registers the User model
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    {
      provide: IUsersRepository,
      useClass: SequelizeUsersRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
