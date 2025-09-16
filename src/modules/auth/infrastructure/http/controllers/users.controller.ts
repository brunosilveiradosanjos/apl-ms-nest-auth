// src/modules/users/users.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'

import { AuthService } from '@/modules/auth/application/services/auth.service'
import { CreateUserDto } from '@/modules/auth/infrastructure/http/dto/create-user.dto'
import { TokenResponseDto } from '@/modules/auth/infrastructure/http/dto/token-response.dto'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Post()
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
  async createUser(@Body() { username, password }: CreateUserDto): Promise<TokenResponseDto> {
    return this.authService.signUp(username, password)
  }
}
