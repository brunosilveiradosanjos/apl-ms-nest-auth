// src/modules/users/users.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { UserService } from '@/modules/user/application/services/user.service'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'
import { UserProfileResponseDto } from '../dto/user-profile-response.dto'

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

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // Tells Swagger that this endpoint requires a Bearer token
  @ApiOperation({ summary: "Get the current authenticated user's profile" })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.', type: UserProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getMyProfile(@Req() req): Promise<UserProfileResponseDto> {
    // The JWT strategy attaches the user payload (containing the id as `sub`) to the request object.
    const userId = req.user.sub
    const user = await this.userService.findById(userId)
    return new UserProfileResponseDto(user)
  }
}
