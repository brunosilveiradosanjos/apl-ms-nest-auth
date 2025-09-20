// src/modules/auth/application/services/auth.service.ts
import {
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { addDays } from 'date-fns'
import { Sequelize } from 'sequelize-typescript'
import * as crypto from 'crypto'

import {
  IUsersRepository,
  IUsersRepository as IUsersRepositorySymbol,
} from '@/modules/user/domain/repositories/i-users.repository'
import {
  IRefreshTokensRepository,
  IRefreshTokensRepository as IRefreshTokensRepositorySymbol,
} from '@/modules/auth/domain/repositories/i-refresh-tokens.repository'
import { generateUniqueId } from '@/shared/utils/generate-unique-id'
import { User } from '@/modules/user/domain/entities/user.entity'
import { TokenResponseDto } from '@/modules/auth/infrastructure/http/dto/token-response.dto'
import { IHashProvider, IHashProvider as IHashProviderSymbol } from '@/modules/auth/infrastructure/providers/hash/i-hash.provider'

@Injectable()
export class AuthService {
  constructor(
    @Inject(IUsersRepositorySymbol)
    private readonly usersRepository: IUsersRepository,
    @Inject(IRefreshTokensRepositorySymbol)
    private readonly refreshTokensRepository: IRefreshTokensRepository,
    @Inject(IHashProviderSymbol) private readonly hashProvider: IHashProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sequelize: Sequelize,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  async login(identifier: string, pass: string): Promise<TokenResponseDto> {
    const user = await this.usersRepository.findByUsernameOrEmail(identifier)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.')
    }

    if (!user.is_active) {
      throw new ForbiddenException('This account has been disabled.')
    }

    const isPasswordMatching = await this.hashProvider.compare(pass, user.password_hash)

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials.')
    }

    void this.usersRepository.updateLastLogin(user.id)

    return this.generateAndSaveTokens(user)
  }

  async validateToken(token: string): Promise<{ sub: string; username: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      })
      return payload
    } catch {
      throw new UnauthorizedException('Invalid or expired token.')
    }
  }

  async refreshToken(token: string): Promise<TokenResponseDto> {
    const tokenHash = this.hashToken(token)
    const existingRefreshToken = await this.refreshTokensRepository.findByTokenHash(tokenHash)

    if (!existingRefreshToken || existingRefreshToken.is_revoked || new Date() > new Date(existingRefreshToken.expires_at)) {
      throw new UnauthorizedException('Refresh token is invalid or expired.')
    }

    const user = await this.usersRepository.findById(existingRefreshToken.user_id)
    if (!user) {
      throw new NotFoundException('User not found.')
    }

    try {
      const result = await this.sequelize.transaction(async () => {
        await this.refreshTokensRepository.revoke(existingRefreshToken.id)
        return this.generateAndSaveTokens(user)
      })
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Refresh token transaction failed:', message)
      throw new InternalServerErrorException('Could not refresh token.')
    }
  }

  private async generateAndSaveTokens(user: User): Promise<TokenResponseDto> {
    const payload = { sub: user.id, username: user.username }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      }),
      crypto.randomBytes(64).toString('hex'),
    ])

    const refreshTokenHash = this.hashToken(refreshToken)
    const refreshTokenExpiresInDays = parseInt(this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRES_IN').replace('d', ''), 10)

    await this.refreshTokensRepository.create({
      id: generateUniqueId(),
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: addDays(new Date(), refreshTokenExpiresInDays),
    })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}
