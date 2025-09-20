// src/modules/user/infrastructure/persistence/sequelize/repositories/sequelize-users.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'
import { IUsersRepository } from '@/modules/user/domain/repositories/i-users.repository'
import { User } from '@/modules/user/domain/entities/user.entity'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { Op } from 'sequelize'

@Injectable()
export class SequelizeUsersRepository implements IUsersRepository {
  constructor(@InjectModel(UserModel) private readonly userModel: typeof UserModel) {}

  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    })
    return user ? user.toJSON() : null
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { username } })
    return user ? user.toJSON() : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } })
    return user ? user.toJSON() : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id)
    return user ? user.toJSON() : null
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser = await this.userModel.create({
      id: generateUniqueId(),
      ...userData,
    })
    return newUser.toJSON()
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.update({ last_login: new Date() }, { where: { id: userId } })
  }
}
