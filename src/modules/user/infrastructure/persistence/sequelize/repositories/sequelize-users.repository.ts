import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { IUsersRepository } from '@/modules/user/domain/repositories/i-users.repository'
import { User } from '@/modules/user/domain/entities/user.entity'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { Op } from 'sequelize'
import { UserModel } from '../models/user.model'

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

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll()
    return users.map((user) => user.toJSON())
  }

  async create(
    userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'is_verified' | 'last_login'>,
  ): Promise<User> {
    const newUser = await this.userModel.create({
      id: generateUniqueId(),
      is_active: true,
      is_verified: false,
      ...userData,
    })
    return newUser.toJSON()
  }

  async update(id: string, data: Partial<Pick<User, 'first_name' | 'last_name'>>): Promise<User> {
    await this.userModel.update(data, { where: { id } })
    const updatedUser = await this.userModel.findByPk(id)
    return updatedUser!.toJSON()
  }

  async delete(id: string): Promise<void> {
    await this.userModel.destroy({ where: { id } })
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.update({ last_login: new Date() }, { where: { id: userId } })
  }
}
