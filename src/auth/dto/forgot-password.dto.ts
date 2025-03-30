import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password recovery',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
