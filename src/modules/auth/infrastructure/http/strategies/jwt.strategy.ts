import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Role } from '@/modules/user/domain/enums/role.enum'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  // This method is called after the token is verified.
  // It returns the payload which NestJS attaches to the request object (e.g., req.user).
  validate(payload: { sub: string; username: string; role: Role }) {
    if (!payload.sub || !payload.username || !payload.role) {
      throw new UnauthorizedException()
    }
    return { sub: payload.sub, username: payload.username, role: payload.role }
  }
}
