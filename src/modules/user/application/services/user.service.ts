import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import {
  IUsersRepository,
  IUsersRepository as IUsersRepositorySymbol,
} from '@/modules/user/domain/repositories/i-users.repository'
import { User } from '@/modules/user/domain/entities/user.entity'
import { UpdateUserProfileDto } from '@/modules/user/infrastructure/http/dto/update-user-profile.dto'

@Injectable()
export class UserService {
  constructor(
    @Inject(IUsersRepositorySymbol)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id)
    if (!user) {
      throw new NotFoundException('User not found.')
    }
    return user
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll()
  }

  async update(id: string, dto: UpdateUserProfileDto): Promise<User> {
    const user = await this.findById(id)

    if (!user) {
      throw new NotFoundException('User not found.')
    }

    const updatedUser = await this.usersRepository.update(id, {
      first_name: dto.firstName,
      last_name: dto.lastName,
    })

    return updatedUser
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id)
    await this.usersRepository.delete(id)
  }
}
