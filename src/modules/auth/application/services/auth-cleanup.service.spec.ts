import { Test, TestingModule } from '@nestjs/testing'
import { AuthCleanupService } from './auth-cleanup.service'
import { IRefreshTokensRepository } from '@/modules/auth/domain/repositories/i-refresh-tokens.repository'

describe('AuthCleanupService', () => {
  let service: AuthCleanupService
  let refreshTokensRepository: jest.Mocked<IRefreshTokensRepository>

  beforeEach(async () => {
    const repoMock = { deleteExpiredTokens: jest.fn() }
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCleanupService, { provide: IRefreshTokensRepository, useValue: repoMock }],
    }).compile()

    service = module.get<AuthCleanupService>(AuthCleanupService)
    refreshTokensRepository = module.get(IRefreshTokensRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should call deleteExpiredTokens when handleCron is executed', async () => {
    refreshTokensRepository.deleteExpiredTokens.mockResolvedValue(5) // Simulate 5 tokens deleted
    await service.handleCron()
    expect(refreshTokensRepository.deleteExpiredTokens).toHaveBeenCalledTimes(1)
  })
})
