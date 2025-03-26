import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset password token sent by email', example: 'abc123-token' })
  @IsString()
  resetPasswordToken: string;

  @ApiProperty({ description: 'New password for the user', example: 'newpassword123' })
  @IsString()
  password: string;
}
