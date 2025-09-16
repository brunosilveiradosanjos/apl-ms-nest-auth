// src/modules/auth/infrastructure/persistence/sequelize/repositories/sequelize-users.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserModel } from '@/modules/auth/infrastructure/persistence/sequelize/models/user.model'
import { IUsersRepository } from '@/modules/auth/domain/repositories/i-users.repository'
import { User } from '@/modules/auth/domain/entities/user.entity'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'

@Injectable()
export class SequelizeUsersRepository implements IUsersRepository {
  constructor(@InjectModel(UserModel) private readonly userModel: typeof UserModel) {}

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { username } })
    return user ? (user.toJSON() as User) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id)
    return user ? (user.toJSON() as User) : null
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser = await this.userModel.create({
      id: generateUniqueId(),
      ...userData,
    })
    return newUser.toJSON() as User
  }
}
