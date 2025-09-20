import { SequelizeUsersRepository } from './sequelize-users.repository'
import { getModelToken } from '@nestjs/sequelize'
import { Test, TestingModule } from '@nestjs/testing'
import { UserModel } from '../models/user.model'
import { userStub } from '../../../../../../../test/stubs/user.stub'
import { Op } from 'sequelize'

const userModelInstance = {
  ...userStub(),
  toJSON: () => userStub(),
}

// Mock the UserModel
const mockUserModel = {
  findOne: jest.fn().mockResolvedValue(userModelInstance), // Return the mock instance
  findByPk: jest.fn().mockResolvedValue(userModelInstance), // Return the mock instance
  create: jest.fn().mockResolvedValue(userModelInstance), // Return the mock instance
  update: jest.fn(),
}

describe('SequelizeUsersRepository', () => {
  let repository: SequelizeUsersRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SequelizeUsersRepository,
        {
          provide: getModelToken(UserModel),
          useValue: mockUserModel,
        },
      ],
    }).compile()

    repository = module.get<SequelizeUsersRepository>(SequelizeUsersRepository)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('findByUsernameOrEmail', () => {
    it('should call findOne with correct query', async () => {
      const identifier = 'test'
      await repository.findByUsernameOrEmail(identifier)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ username: identifier }, { email: identifier }],
        },
      })
    })
  })

  describe('findByUsername', () => {
    it('should call findOne with correct query', async () => {
      const username = 'johndoe'
      await repository.findByUsername(username)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { username } })
    })
  })

  describe('findByEmail', () => {
    it('should call findOne with correct query', async () => {
      const email = 'john.doe@example.com'
      await repository.findByEmail(email)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email } })
    })
  })

  describe('create', () => {
    it('should call create with correct user data', async () => {
      const { ...userData } = userStub()
      mockUserModel.create.mockResolvedValue({ toJSON: () => userData })
      await repository.create(userData)
      expect(mockUserModel.create).toHaveBeenCalledWith(expect.objectContaining(userData))
    })
  })
})
