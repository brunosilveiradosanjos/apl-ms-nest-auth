// src/modules/user/application/services/auth.service.ts
import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import {
  IUsersRepository,
  IUsersRepository as IUsersRepositorySymbol,
} from '@/modules/user/domain/repositories/i-users.repository'
import { IHashProvider, IHashProvider as IHashProviderSymbol } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider'
import { User } from '@/modules/user/domain/entities/user.entity'
import { Role } from '@/modules/user/domain/enums/role.enum'
import { UpdateUserProfileDto } from '@/modules/user/infrastructure/http/dto/update-user-profile.dto'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'

@Injectable()
export class UserService {
  constructor(
    @Inject(IUsersRepositorySymbol)
    private readonly usersRepository: IUsersRepository,
    @Inject(IHashProviderSymbol)
    private readonly hashProvider: IHashProvider,
  ) {}

  async signUp(dto: CreateUserDto): Promise<void> {
    // 1. Check if user already exists
    if (await this.usersRepository.findByUsername(dto.username)) {
      throw new ConflictException('Username already exists.')
    }
    if (await this.usersRepository.findByEmail(dto.email)) {
      throw new ConflictException('Email address is already in use.')
    }

    // 2. Hash the password
    const password_hash = await this.hashProvider.hash(dto.password)

    // 3. Create the user in the database
    const newUser = await this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      password_hash,
      first_name: dto.firstName,
      last_name: dto.lastName,
      role: Role.User, // Assign default role on creation
    })

    await this.usersRepository.associateWithClient(newUser.id, dto.client_id)
  }
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`)
    }
    return user
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll()
  }

  async update(id: string, dto: UpdateUserProfileDto): Promise<User> {
    const user = await this.findById(id)
    const dataToUpdate = {
      first_name: dto.firstName,
      last_name: dto.lastName,
    }
    return this.usersRepository.update(user.id, dataToUpdate)
  }

  async delete(id: string): Promise<void> {
    await this.findById(id) // Ensure user exists before deleting
    await this.usersRepository.delete(id)
  }
}
