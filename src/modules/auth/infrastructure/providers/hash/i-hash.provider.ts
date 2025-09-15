// src/modules/auth/infrastructure/providers/hash/i-hash.provider.ts
export const IHashProvider = Symbol('IHashProvider')

export interface IHashProvider {
  hash(plain: string): Promise<string>
  compare(plain: string, hashed: string): Promise<boolean>
}
