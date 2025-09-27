import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { UserService } from './user.service'
import { userStub } from '$/stubs/user.stub'
import { User } from '@/modules/user/domain/entities/user.entity'
import {
  IUsersRepository,
  IUsersRepository as IUsersRepositorySymbol,
} from '@/modules/user/domain/repositories/i-users.repository'
import { IHashProvider, IHashProvider as IHashProviderSymbol } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'
import { UpdateUserProfileDto } from '@/modules/user/infrastructure/http/dto/update-user-profile.dto'
import { Role } from '@/modules/user/domain/enums/role.enum'

describe('UserService', () => {
  let userService: UserService
  let usersRepository: jest.Mocked<IUsersRepository>
  let hashProvider: jest.Mocked<IHashProvider>

  beforeEach(async () => {
    const usersRepositoryMock = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      associateWithClient: jest.fn(),
      findByClientIdAndUsernameOrEmail: jest.fn(),
      updateLastLogin: jest.fn(),
    }

    const hashProviderMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: IUsersRepositorySymbol, useValue: usersRepositoryMock },
        { provide: IHashProviderSymbol, useValue: hashProviderMock },
      ],
    }).compile()

    userService = module.get<UserService>(UserService)
    usersRepository = module.get(IUsersRepositorySymbol)
    hashProvider = module.get(IHashProviderSymbol)
  })

  it('should be defined', () => {
    expect(userService).toBeDefined()
  })

  describe('signUp', () => {
    const signUpDto: CreateUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      client_id: 'client-123',
      firstName: 'New',
      lastName: 'User',
    }

    it('should throw ConflictException if username exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(userStub())
      await expect(userService.signUp(signUpDto)).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException if email exists', async () => {
      usersRepository.findByUsername.mockResolvedValue(null)
      usersRepository.findByEmail.mockResolvedValue(userStub())
      await expect(userService.signUp(signUpDto)).rejects.toThrow(ConflictException)
    })

    it('should create a user and associate it with a client successfully', async () => {
      // Arrange
      usersRepository.findByUsername.mockResolvedValue(null)
      usersRepository.findByEmail.mockResolvedValue(null)
      hashProvider.hash.mockResolvedValue('hashed_password')
      // --- FIX: Mock `create` to return a user object ---
      usersRepository.create.mockResolvedValue(userStub())

      // Act
      await userService.signUp(signUpDto)

      // 2. Verify the user was created with the correct data
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: signUpDto.username,
        email: signUpDto.email,
        password_hash: 'hashed_password',
        first_name: signUpDto.firstName,
        last_name: signUpDto.lastName,
        role: Role.User,
      })

      // 3. Verify the new user was associated with the client
      expect(usersRepository.associateWithClient).toHaveBeenCalledWith(userStub().id, signUpDto.client_id)
    })
  })

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = userStub()
      usersRepository.findById.mockResolvedValue(user)
      await expect(userService.findById(user.id)).resolves.toEqual(user)
    })

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findById.mockResolvedValue(null)
      await expect(userService.findById('1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [userStub()]
      usersRepository.findAll.mockResolvedValue(users)
      await expect(userService.findAll()).resolves.toEqual(users)
    })
  })

  describe('update', () => {
    it('should update and return a user', async () => {
      const user = userStub()
      const updateData: UpdateUserProfileDto = { firstName: 'Jane' }

      const updatedUser = { ...user, first_name: 'Jane' }
      usersRepository.findById.mockResolvedValue(user)
      usersRepository.update.mockResolvedValue(updatedUser as User)

      const result = await userService.update(user.id, updateData)

      expect(usersRepository.update).toHaveBeenCalledWith(user.id, {
        first_name: 'Jane',
        last_name: undefined,
      })
      expect(result.first_name).toBe('Jane')
    })
  })

  describe('delete', () => {
    it('should soft delete a user', async () => {
      const user = userStub()
      usersRepository.findById.mockResolvedValue(user)

      await userService.delete(user.id)

      expect(usersRepository.delete).toHaveBeenCalledWith(user.id)
    })
  })
})
