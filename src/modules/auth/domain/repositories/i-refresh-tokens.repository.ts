import { RefreshToken } from '@/modules/auth/domain/entities/refresh-token.entity'

export const IRefreshTokensRepository = Symbol('IRefreshTokensRepository')

export interface IRefreshTokensRepository {
  create(token: Omit<RefreshToken, 'is_revoked'>): Promise<RefreshToken>
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>
  revoke(id: string): Promise<void>
  deleteExpiredTokens(): Promise<number>
}
