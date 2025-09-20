// src/modules/users/users.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'

import { UserService } from '@/modules/user/application/services/user.service'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'
import { TokenResponseDto } from '@/modules/auth/infrastructure/http/dto/token-response.dto'
import { User } from '@/modules/user/domain/entities/user.entity'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

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
  async createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.signUp({
      username: dto.username,
      email: dto.email,
      pass: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    })
  }
}
