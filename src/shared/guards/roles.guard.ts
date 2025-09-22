import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@/modules/user/domain/enums/role.enum'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!requiredRoles) {
      return true // If no roles are required, allow access
    }
    const { user } = context.switchToHttp().getRequest()
    // The user object is attached by the JwtStrategy
    return requiredRoles.some((role) => user.role === role)
  }
}
