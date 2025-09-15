// src/modules/auth/infrastructure/providers/hash/bcrypt-hash.provider.ts
import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { IHashProvider } from './i-hash.provider'

@Injectable()
export class BcryptHashProvider implements IHashProvider {
  private readonly saltRounds = 10

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
