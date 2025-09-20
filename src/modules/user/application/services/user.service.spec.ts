import { Test, TestingModule } from '@nestjs/testing'
import { IUsersRepository } from '@/modules/user/domain/repositories/i-users.repository'
import { IRefreshTokensRepository } from '@/modules/auth/domain/repositories/i-refresh-tokens.repository'
import { IHashProvider } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Sequelize } from 'sequelize-typescript'
import { userStub } from '../../../../../test/stubs/user.stub'
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common'
import { User } from '@/modules/user/domain/entities/user.entity'
import { UserService } from './user.service'

describe('UserService', () => {
  let userService: UserService
  // Create typed mocks for all dependencies
  let usersRepository: jest.Mocked<IUsersRepository>
  let refreshTokensRepository: jest.Mocked<IRefreshTokensRepository>
  let hashProvider: jest.Mocked<IHashProvider>
  let jwtService: jest.Mocked<JwtService>
  let sequelize: jest.Mocked<Sequelize>

  beforeEach(async () => {
    // Define the mock implementations
    const usersRepositoryMock = {
      findByUsernameOrEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
    }

    const refreshTokensRepositoryMock = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      revoke: jest.fn(),
      deleteExpiredTokens: jest.fn(),
    }

    const hashProviderMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    }

    const jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    }

    const configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'test_secret'
        if (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN') return '15m'
        return null
      }),
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') return '7d' // <-- This provides the needed value
        throw new Error(`Missing config key: ${key}`)
      }),
    }
    const sequelizeMock = { transaction: jest.fn().mockImplementation((cb) => cb()) }

    // Create the testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: IUsersRepository, useValue: usersRepositoryMock },
        { provide: IRefreshTokensRepository, useValue: refreshTokensRepositoryMock },
        { provide: IHashProvider, useValue: hashProviderMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: Sequelize, useValue: sequelizeMock },
      ],
    }).compile()

    // Get instances of the service and mocks
    userService = module.get<UserService>(UserService)
    usersRepository = module.get(IUsersRepository)
    refreshTokensRepository = module.get(IRefreshTokensRepository)
    hashProvider = module.get(IHashProvider)
    jwtService = module.get(JwtService)
    sequelize = module.get(Sequelize)
  })

  it('should be defined', () => {
    expect(userService).toBeDefined()
  })

  describe('signUp', () => {
    const signUpDto = {
      username: 'newuser',
      email: 'new@example.com',
      pass: 'password123',
    }

    it('should throw ConflictException if username already exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(userStub())
      await expect(userService.signUp(signUpDto)).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException if email already exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(null)
      usersRepository.findByEmail.mockResolvedValue(userStub())
      await expect(userService.signUp(signUpDto)).rejects.toThrow(ConflictException)
    })

    it('should create user and return tokens on success', async () => {
      usersRepository.findByUsername.mockResolvedValue(null)
      usersRepository.findByEmail.mockResolvedValue(null)
      hashProvider.hash.mockResolvedValue('hashed_password')
      const createdUser = { ...userStub(), ...signUpDto }
      usersRepository.create.mockResolvedValue(createdUser as User)
      jwtService.signAsync.mockResolvedValue('fake_token')

      const result = await userService.signUp(signUpDto)

      expect(usersRepository.create).toHaveBeenCalledWith({
        username: signUpDto.username,
        email: signUpDto.email,
        password_hash: 'hashed_password',
        first_name: undefined,
        last_name: undefined,
      })
      expect(result).toHaveProperty('access_token')
    })
  })
})
