// src/modules/auth/application/services/auth-cleanup.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  IRefreshTokensRepository,
  IRefreshTokensRepository as IRefreshTokensRepositorySymbol,
} from '@/modules/auth/domain/repositories/i-refresh-tokens.repository'

@Injectable()
export class AuthCleanupService {
  private readonly logger = new Logger(AuthCleanupService.name)

  constructor(
    @Inject(IRefreshTokensRepositorySymbol)
    private readonly refreshTokensRepository: IRefreshTokensRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM) // Runs every day at 3 AM
  async handleCron() {
    this.logger.log('Running daily cleanup of expired refresh tokens...')
    try {
      const deletedCount = await this.refreshTokensRepository.deleteExpiredTokens()
      this.logger.log(`Successfully deleted ${deletedCount} expired refresh token(s).`)
    } catch (error) {
      this.logger.error('Failed to cleanup expired refresh tokens.', error.stack)
    }
  }
}
