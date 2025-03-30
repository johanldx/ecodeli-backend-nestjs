import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsString()
  password: string;
}
