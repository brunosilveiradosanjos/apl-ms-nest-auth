import { Controller, Get, Param, Patch, Delete, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { UserService } from '@/modules/user/application/services/user.service'
import { UserProfileResponseDto } from '../dto/user-profile-response.dto'
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto'
import { User } from '@/modules/user/domain/entities/user.entity'

@ApiTags('User Management')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // This private helper handles the mapping from entity to DTO
  private toProfileDto(user: User): UserProfileResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name || null, // Map from snake_case
      lastName: user.last_name || null, // to camelCase
      isActive: user.is_active,
    }
  }

  @Get('me')
  @ApiOperation({ summary: "Get the current user's profile" })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async getMyProfile(@Req() req): Promise<UserProfileResponseDto> {
    const user = await this.userService.findById(req.user.sub)
    return this.toProfileDto(user)
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the current user's profile" })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async updateMyProfile(@Req() req, @Body() dto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    const updatedUser = await this.userService.update(req.user.sub, dto)
    return this.toProfileDto(updatedUser)
  }

  // --- Admin Routes ---

  @Get()
  @ApiOperation({ summary: 'List all users (Admin)' })
  @ApiResponse({ status: 200, type: [UserProfileResponseDto] })
  async findAll(): Promise<UserProfileResponseDto[]> {
    const users = await this.userService.findAll()
    return users.map(this.toProfileDto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (Admin)' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async findById(@Param('id') id: string): Promise<UserProfileResponseDto> {
    const user = await this.userService.findById(id)
    return this.toProfileDto(user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID (Admin)' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async updateById(@Param('id') id: string, @Body() dto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
    const user = await this.userService.update(id, dto)
    return this.toProfileDto(user)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a user by ID (Admin)' })
  @ApiResponse({ status: 204 })
  async deleteById(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id)
  }
}
