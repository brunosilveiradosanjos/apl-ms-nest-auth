// src/modules/auth/infrastructure/http/controllers/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'

import { AuthService } from '@/modules/auth/application/services/auth.service'
import { TokenRequestDto } from '@/modules/auth/infrastructure/http/dto/token-request.dto'
import { TokenResponseDto } from '@/modules/auth/infrastructure/http/dto/token-response.dto'
import { ValidateTokenDto } from '@/modules/auth/infrastructure/http/dto/validate-token.dto'
import { RefreshTokenDto } from '@/modules/auth/infrastructure/http/dto/refresh-token.dto'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and receive tokens' })
  @ApiBody({ type: TokenRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getToken(@Body() { identifier, password }: TokenRequestDto): Promise<TokenResponseDto> {
    return this.authService.login(identifier, password)
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate an access token' })
  @ApiBody({ type: ValidateTokenDto })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired' })
  async validateToken(@Body() { token }: ValidateTokenDto) {
    const payload = await this.authService.validateToken(token)
    return {
      statusCode: HttpStatus.OK,
      message: 'Token is valid',
      data: payload,
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh an access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token is invalid or expired',
  })
  async refreshToken(@Body() { refreshToken }: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshToken)
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user and receive authentication tokens' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created and authenticated successfully.',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request: Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Conflict: Username already exists.' })
  async signUp(@Body() dto: CreateUserDto): Promise<TokenResponseDto> {
    return this.authService.signUp({
      username: dto.username,
      email: dto.email,
      pass: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    })
  }
}
