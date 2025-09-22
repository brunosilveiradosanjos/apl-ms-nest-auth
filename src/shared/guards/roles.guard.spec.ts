import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'
import { Role } from '@/modules/user/domain/enums/role.enum'

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    guard = new RolesGuard(reflector)
  })

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Role.User } }) }),
    } as any
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should allow access if user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin])
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Role.Admin } }) }),
    } as any
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should deny access if user does not have the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin])
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Role.User } }) }),
    } as any
    expect(guard.canActivate(context)).toBe(false)
  })

  it('should deny access if user has no role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin])
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: {} }) }),
    } as any
    expect(guard.canActivate(context)).toBe(false)
  })
})
