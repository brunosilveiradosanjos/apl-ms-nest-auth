// src/modules/user/infrastructure/persistence/sequelize/repositories/sequelize-users.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { UserModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user.model'
import { IUsersRepository } from '@/modules/user/domain/repositories/i-users.repository'
import { User } from '@/modules/user/domain/entities/user.entity'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { Op } from 'sequelize'
import { ClientModel } from '@/modules/client/infrastructure/persistence/sequelize/models/client.model'
import { UserClientModel } from '@/modules/user/infrastructure/persistence/sequelize/models/user-client.model'

@Injectable()
export class SequelizeUsersRepository implements IUsersRepository {
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(UserClientModel) private readonly userClientModel: typeof UserClientModel,
  ) {}
  async findByClientIdAndUsernameOrEmail(clientId: string, identifier: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
      include: [
        {
          model: ClientModel,
          where: { id: clientId },
          required: true, // Ensures only users associated with the client are returned
        },
      ],
    })
    return user ? user.toJSON() : null
  }

  async associateWithClient(userId: string, clientId: string): Promise<void> {
    await this.userClientModel.create({
      user_id: userId,
      client_id: clientId,
    })
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

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll()
    return users.map((user) => user.toJSON())
  }

  async update(id: string, data: Partial<Pick<User, 'first_name' | 'last_name'>>): Promise<User> {
    await this.userModel.update(data, { where: { id } })
    const updatedUser = await this.findById(id)
    if (!updatedUser) {
      // This should ideally not happen if the update is successful,
      // but it's good practice to handle the possibility.
      throw new Error('Failed to retrieve updated user.')
    }
    return updatedUser
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error(`User with ID ${id} not found.`)
    }
    if (user) {
      // Soft delete by setting the user to inactive
      user.is_active = false
      await this.userModel.update({ is_active: false }, { where: { id } })
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.update({ last_login: new Date() }, { where: { id: userId } })
  }
}
