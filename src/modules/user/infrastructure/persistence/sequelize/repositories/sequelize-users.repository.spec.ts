import { SequelizeUsersRepository } from './sequelize-users.repository'
import { getModelToken } from '@nestjs/sequelize'
import { Test, TestingModule } from '@nestjs/testing'
import { UserModel } from '../models/user.model'
import { userStub } from '../../../../../../../test/stubs/user.stub'
import { Op } from 'sequelize'
import { User } from '@/modules/user/domain/entities/user.entity'

const userModelInstance = {
  ...userStub(),
  toJSON: () => userStub(),
}

// Mock the UserModel with all necessary methods
const mockUserModel = {
  findOne: jest.fn().mockResolvedValue(userModelInstance),
  findByPk: jest.fn().mockResolvedValue(userModelInstance),
  findAll: jest.fn().mockResolvedValue([userModelInstance]),
  create: jest.fn().mockResolvedValue(userModelInstance),
  update: jest.fn().mockResolvedValue([1]), // Sequelize update returns an array with the number of affected rows
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
  // Common user data for consistent comparisons, omitting the volatile last_login date
  const userStubWithoutDate = (({ last_login, ...rest }) => rest)(userStub())

  describe('findByUsernameOrEmail', () => {
    it('should call findOne with correct query and return a user', async () => {
      const identifier = 'test'
      const user = await repository.findByUsernameOrEmail(identifier)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ username: identifier }, { email: identifier }],
        },
      })
      expect(user).toEqual(userStub())
    })

    it('should return null if user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null)
      const user = await repository.findByUsernameOrEmail('test')
      expect(user).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should call findOne with correct query and return a user', async () => {
      mockUserModel.findOne.mockResolvedValue(userModelInstance)
      const username = 'johndoe'
      const user = await repository.findByUsername(username)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { username } })
      expect(user).toEqual(expect.objectContaining(userStubWithoutDate))
    })
  })

  describe('findByEmail', () => {
    it('should call findOne with correct query and return a user', async () => {
      mockUserModel.findOne.mockResolvedValue(userModelInstance)
      const email = 'john.doe@example.com'
      const user = await repository.findByEmail(email)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email } })
      expect(user).toEqual(expect.objectContaining(userStubWithoutDate))
    })
  })

  describe('findById', () => {
    it('should call findByPk with correct id and return a user', async () => {
      const id = userStub().id
      const user = await repository.findById(id)
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(id)
      expect(user).toEqual(userStub())
    })
  })

  describe('create', () => {
    it('should call create with correct user data and return the new user', async () => {
      mockUserModel.create.mockResolvedValue(userModelInstance)
      const { id, ...createData } = userStub() // Use the stub to create data
      const newUser = await repository.create(createData)

      expect(mockUserModel.create).toHaveBeenCalledWith(expect.any(Object))
      expect(newUser).toEqual(expect.objectContaining(userStubWithoutDate))
    })
  })

  describe('findAll', () => {
    it('should call findAll and return an array of users', async () => {
      mockUserModel.findAll.mockResolvedValue([userModelInstance])
      const users = await repository.findAll()
      expect(mockUserModel.findAll).toHaveBeenCalled()
      expect(users).toEqual([expect.objectContaining(userStubWithoutDate)])
    })
  })

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const id = userStub().id
      const dataToUpdate = { first_name: 'Jane' }
      const updatedUserStub = { ...userStub(), first_name: 'Jane' }

      // First call to findById within the update method
      mockUserModel.findByPk.mockResolvedValueOnce({ ...userModelInstance, toJSON: () => updatedUserStub })

      const updatedUser = await repository.update(id, dataToUpdate)

      expect(mockUserModel.update).toHaveBeenCalledWith(dataToUpdate, { where: { id } })
      expect(mockUserModel.findByPk).toHaveBeenCalledWith(id)
      expect(updatedUser.first_name).toEqual('Jane')
    })

    it('should throw an error if the user to update is not found', async () => {
      const id = 'non-existent-id'
      mockUserModel.update.mockResolvedValue([0]) // No rows affected
      mockUserModel.findByPk.mockResolvedValue(null) // findById will return null

      await expect(repository.update(id, { first_name: 'Jane' })).rejects.toThrow('Failed to retrieve updated user.')
    })
  })

  describe('delete', () => {
    it('should soft delete a user by setting is_active to false', async () => {
      const id = userStub().id
      mockUserModel.findByPk.mockResolvedValue(userModelInstance) // Ensure findById returns a user

      await repository.delete(id)

      expect(mockUserModel.findByPk).toHaveBeenCalledWith(id)
      expect(mockUserModel.update).toHaveBeenCalledWith({ is_active: false }, { where: { id } })
    })

    it('should throw an error if user to delete is not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null)
      await expect(repository.delete('non-existent-id')).rejects.toThrow('User with ID non-existent-id not found.')
    })
  })

  describe('updateLastLogin', () => {
    it('should update the last_login field for a user', async () => {
      const userId = userStub().id
      await repository.updateLastLogin(userId)
      expect(mockUserModel.update).toHaveBeenCalledWith({ last_login: expect.any(Date) }, { where: { id: userId } })
    })
  })
})
