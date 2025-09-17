import { BcryptHashProvider } from './bcrypt-hash.provider'
import * as bcrypt from 'bcryptjs'

// Mock the entire bcryptjs library
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_value'),
  compare: jest.fn().mockResolvedValue(true),
}))

describe('BcryptHashProvider', () => {
  let provider: BcryptHashProvider

  beforeEach(() => {
    provider = new BcryptHashProvider()
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('hash', () => {
    it('should call bcrypt.hash with the correct value and salt rounds', async () => {
      const plainText = 'password123'
      await provider.hash(plainText)
      expect(bcrypt.hash).toHaveBeenCalledWith(plainText, 10)
    })
  })

  describe('compare', () => {
    it('should call bcrypt.compare with the correct values', async () => {
      const plainText = 'password123'
      const hashedText = 'hashed_value'
      await provider.compare(plainText, hashedText)
      expect(bcrypt.compare).toHaveBeenCalledWith(plainText, hashedText)
    })
  })
})
