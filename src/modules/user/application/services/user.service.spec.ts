import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import { UserService } from './user.service'
import { userStub } from '../../../../../test/stubs/user.stub'
import { User } from '@/modules/user/domain/entities/user.entity'
import {
  IUsersRepository,
  IUsersRepository as IUsersRepositorySymbol,
} from '@/modules/user/domain/repositories/i-users.repository'
import { IHashProvider, IHashProvider as IHashProviderSymbol } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider' // <-- Import the symbol

describe('UserService', () => {
  let userService: UserService
  let usersRepository: jest.Mocked<IUsersRepository>
  let hashProvider: jest.Mocked<IHashProvider>

  const signUpDto = {
    username: 'newuser',
    email: 'new@example.com',
    pass: 'password123',
    firstName: 'Test',
    lastName: 'User',
  }

  beforeEach(async () => {
    // Define mock implementations for only the required dependencies
    const usersRepositoryMock = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      // Add other methods from the interface if needed for other tests
    }

    const hashProviderMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUsersRepositorySymbol, // <-- Use the correct Symbol
          useValue: usersRepositoryMock,
        },
        {
          provide: IHashProviderSymbol, // <-- Use the correct Symbol
          useValue: hashProviderMock,
        },
      ],
    }).compile()

    // Get instances of the service and its mocks
    userService = module.get<UserService>(UserService)
    usersRepository = module.get(IUsersRepositorySymbol)
    hashProvider = module.get(IHashProviderSymbol)
  })

  it('should be defined', () => {
    expect(userService).toBeDefined()
  })

  describe('signUp', () => {
    it('should throw ConflictException if username already exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(userStub())

      await expect(userService.signUp(signUpDto)).rejects.toThrow(new ConflictException('Username already exists.'))
      // Ensure other functions are not called in this failure path
      expect(usersRepository.findByEmail).not.toHaveBeenCalled()
      expect(hashProvider.hash).not.toHaveBeenCalled()
      expect(usersRepository.create).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if email already exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(null)
      usersRepository.findByEmail.mockResolvedValue(userStub())

      await expect(userService.signUp(signUpDto)).rejects.toThrow(new ConflictException('Email address is already in use.'))
      expect(hashProvider.hash).not.toHaveBeenCalled()
      expect(usersRepository.create).not.toHaveBeenCalled()
    })

    it('should successfully create a new user', async () => {
      usersRepository.findByUsername.mockResolvedValue(null)
      usersRepository.findByEmail.mockResolvedValue(null)
      hashProvider.hash.mockResolvedValue('hashed_password')
      usersRepository.create.mockResolvedValue({ ...userStub(), ...signUpDto } as User)

      await expect(userService.signUp(signUpDto)).resolves.toBeUndefined()

      expect(hashProvider.hash).toHaveBeenCalledWith(signUpDto.pass)
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: signUpDto.username,
        email: signUpDto.email,
        password_hash: 'hashed_password',
        first_name: signUpDto.firstName,
        last_name: signUpDto.lastName,
      })
    })
  })
})
