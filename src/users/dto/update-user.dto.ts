import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'First name of the user', required: false })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiProperty({ description: 'Last name of the user', required: false })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiProperty({ description: 'Email of the user', required: false })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'Password for the user account', required: false })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ description: 'Indicates if the user is verified', required: false })
  @IsBoolean()
  @IsOptional()
  verified: boolean;

  @ApiProperty({ description: 'Indicates if the user is active', required: false })
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @ApiProperty({ description: 'Indicates if the user is an administrator', required: false })
  @IsBoolean()
  @IsOptional()
  administrator: boolean;
}