// src/modules/users/users.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { UserService } from '@/modules/user/application/services/user.service'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Sign Up)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' }) // Updated: No response body
  @ApiResponse({ status: 409, description: 'Conflict: Username or email already exists.' })
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    await this.userService.signUp({
      username: dto.username,
      email: dto.email,
      pass: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    })
  }
}
