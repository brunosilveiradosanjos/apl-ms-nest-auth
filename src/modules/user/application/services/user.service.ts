// src/modules/user/application/services/auth.service.ts
import { Inject, Injectable, ConflictException } from '@nestjs/common'

import {
  IUsersRepository,
  IUsersRepository as IUsersRepositorySymbol,
} from '@/modules/user/domain/repositories/i-users.repository'
import { User } from '@/modules/user/domain/entities/user.entity'
import { IHashProvider, IHashProvider as IHashProviderSymbol } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider'

@Injectable()
export class UserService {
  constructor(
    @Inject(IUsersRepositorySymbol)
    private readonly usersRepository: IUsersRepository,
    @Inject(IHashProviderSymbol)
    private readonly hashProvider: IHashProvider,
  ) {}

  async signUp(dto: { username: string; email: string; pass: string; firstName?: string; lastName?: string }): Promise<User> {
    // 1. Check if user already exists
    if (await this.usersRepository.findByUsername(dto.username)) {
      throw new ConflictException('Username already exists.')
    }
    if (await this.usersRepository.findByEmail(dto.email)) {
      throw new ConflictException('Email address is already in use.')
    }

    // 2. Hash the password
    const password_hash = await this.hashProvider.hash(dto.pass)

    // 3. Create the user in the database
    const newUser = await this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      password_hash,
      first_name: dto.firstName,
      last_name: dto.lastName,
    })

    return newUser

    // 4. Reuse token generation logic to log the new user in
    // return this.generateAndSaveTokens(newUser)
  }
}
