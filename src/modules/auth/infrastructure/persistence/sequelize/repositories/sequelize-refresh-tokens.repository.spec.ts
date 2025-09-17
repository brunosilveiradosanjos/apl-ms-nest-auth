import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/sequelize'
import { SequelizeRefreshTokensRepository } from './sequelize-refresh-tokens.repository'
import { RefreshTokenModel } from '../models/refresh-token.model'
import { Op } from 'sequelize'

// Mock the RefreshTokenModel
const mockRefreshTokenModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}

describe('SequelizeRefreshTokensRepository', () => {
  let repository: SequelizeRefreshTokensRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SequelizeRefreshTokensRepository,
        {
          provide: getModelToken(RefreshTokenModel),
          useValue: mockRefreshTokenModel,
        },
      ],
    }).compile()

    repository = module.get<SequelizeRefreshTokensRepository>(SequelizeRefreshTokensRepository)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('create', () => {
    it('should call create with correct token data', async () => {
      const tokenData = {
        id: '1',
        user_id: '1',
        token_hash: 'hash',
        expires_at: new Date(),
      }
      mockRefreshTokenModel.create.mockResolvedValue({ toJSON: () => tokenData })
      await repository.create(tokenData)
      expect(mockRefreshTokenModel.create).toHaveBeenCalledWith(tokenData)
    })
  })

  describe('findByTokenHash', () => {
    it('should call findOne with correct query', async () => {
      const tokenHash = 'some_hash'
      await repository.findByTokenHash(tokenHash)
      expect(mockRefreshTokenModel.findOne).toHaveBeenCalledWith({
        where: { token_hash: tokenHash, is_revoked: false },
      })
    })
  })

  describe('revoke', () => {
    it('should call update with is_revoked true', async () => {
      const tokenId = '123'
      await repository.revoke(tokenId)
      expect(mockRefreshTokenModel.update).toHaveBeenCalledWith({ is_revoked: true }, { where: { id: tokenId } })
    })
  })

  describe('deleteExpiredTokens', () => {
    it('should call destroy with correct query for expired tokens', async () => {
      await repository.deleteExpiredTokens()
      expect(mockRefreshTokenModel.destroy).toHaveBeenCalledWith({
        // Expected by the old test
        where: {
          [Op.or]: [
            { expires_at: { [Op.lt]: expect.any(Date) } },
            { is_revoked: true, updatedAt: { [Op.lt]: expect.any(Date) } },
          ],
        },
      })
    })
  })
})
