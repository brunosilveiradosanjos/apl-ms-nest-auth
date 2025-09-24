// src/modules/users/users.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Param, Patch, Delete } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { UserService } from '@/modules/user/application/services/user.service'
import { CreateUserDto } from '@/modules/user/infrastructure/http/dto/create-user.dto'
import { UserProfileResponseDto } from '../dto/user-profile-response.dto'
import { Roles } from '@/shared/decorators/roles.decorator'
import { Role } from '@/modules/user/domain/enums/role.enum'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user (Sign Up)',
    description: `
    Creates a new user account. The password must meet the following criteria:
    - Minimum length of 10 characters
    - At least one uppercase letter (A-Z)
    - At least one lowercase letter (a-z)
    - At least one number (0-9)
    - At least one special character (e.g., !@#$%^&*)
    `,
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' }) // Updated: No response body
  @ApiResponse({ status: 409, description: 'Conflict: Username or email already exists.' })
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    await this.userService.signUp({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      client_id: dto.client_id,
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
  // --- Admin Routes ---

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users (Admin)' })
  @ApiResponse({ status: 200, type: [UserProfileResponseDto] })
  async findAll(): Promise<UserProfileResponseDto[]> {
    const users = await this.userService.findAll()
    return users.map((user) => new UserProfileResponseDto(user))
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID (Admin)' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async findById(@Param('id') id: string): Promise<UserProfileResponseDto> {
    const user = await this.userService.findById(id)
    return new UserProfileResponseDto(user)
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user by ID (Admin)' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async updateById(@Param('id') id: string, @Body() dto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    const updatedUser = await this.userService.update(id, dto)
    return new UserProfileResponseDto(updatedUser)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a user by ID (Admin)' })
  @ApiResponse({ status: 204, description: 'User deactivated successfully' })
  async deleteById(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id)
  }
}
