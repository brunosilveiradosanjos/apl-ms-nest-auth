import { ApiProperty } from '@nestjs/swagger'

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'a1b2c3d4e5f6...',
  })
  refresh_token: string
}
