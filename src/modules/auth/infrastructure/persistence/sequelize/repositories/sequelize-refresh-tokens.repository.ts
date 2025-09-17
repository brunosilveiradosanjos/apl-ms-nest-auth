// src/modules/auth/infrastructure/persistence/sequelize/repositories/sequelize-refresh-tokens.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { RefreshTokenModel } from '@/modules/auth/infrastructure/persistence/sequelize/models/refresh-token.model'
import { IRefreshTokensRepository } from '@/modules/auth/domain/repositories/i-refresh-tokens.repository'
import { RefreshToken } from '@/modules/auth/domain/entities/refresh-token.entity'

@Injectable()
export class SequelizeRefreshTokensRepository implements IRefreshTokensRepository {
  constructor(
    @InjectModel(RefreshTokenModel)
    private readonly refreshTokenModel: typeof RefreshTokenModel,
  ) {}

  async create(tokenData: Omit<RefreshToken, 'is_revoked'>): Promise<RefreshToken> {
    const token = await this.refreshTokenModel.create(tokenData)
    return token.toJSON()
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await this.refreshTokenModel.findOne({
      where: { token_hash: tokenHash, is_revoked: false },
    })
    return token ? token.toJSON() : null
  }

  async revoke(id: string): Promise<void> {
    await this.refreshTokenModel.update({ is_revoked: true }, { where: { id } })
  }

  async deleteExpiredTokens(): Promise<number> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return this.refreshTokenModel.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { is_revoked: true, updatedAt: { [Op.lt]: yesterday } }, // Clean up revoked tokens older than 1 day
        ],
      },
    })
  }
}
