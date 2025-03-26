// src/users/dto/user-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: false })
  administrator: boolean;

  @ApiProperty({ example: '2023-05-01T00:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2023-05-01T12:00:00Z' })
  updated_at: Date;
}
