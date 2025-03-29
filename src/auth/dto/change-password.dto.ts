import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsNotEmpty({ message: 'L\'ancien mot de passe est requis.' })
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword123' })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis.' })
  newPassword: string;
}