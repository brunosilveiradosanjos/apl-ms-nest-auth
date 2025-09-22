import { Test, TestingModule } from '@nestjs/testing'
import { JwtStrategy } from './jwt.strategy'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException } from '@nestjs/common'
import { Role } from '@/modules/user/domain/enums/role.enum'

describe('JwtStrategy', () => {
  let strategy: JwtStrategy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test_secret') },
        },
      ],
    }).compile()
    strategy = module.get<JwtStrategy>(JwtStrategy)
  })

  it('should be defined', () => {
    expect(strategy).toBeDefined()
  })

  it('should validate and return the user payload', () => {
    const payload = { sub: 'user-id', username: 'testuser', role: Role.User }
    const result = strategy.validate(payload)
    expect(result).toEqual(payload)
  })

  it('should throw UnauthorizedException for an invalid payload', async () => {
    await expect(strategy.validate({} as any)).rejects.toThrow(UnauthorizedException)
  })
})
