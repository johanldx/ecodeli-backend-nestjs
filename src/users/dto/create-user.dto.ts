import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  last_name: string;

  @ApiProperty({ description: 'Email of the user', uniqueItems: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the user account' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Indicates if the user is verified', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  verified: boolean;

  @ApiProperty({ description: 'Indicates if the user is active', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @ApiProperty({ description: 'Indicates if the user is an administrator', default: false, required: false })
  @IsBoolean()
  @IsOptional()
  administrator: boolean;
}