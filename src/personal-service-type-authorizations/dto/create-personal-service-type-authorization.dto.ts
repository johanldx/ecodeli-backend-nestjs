import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePersonalServiceTypeAuthorizationDto {
  @ApiProperty({ description: 'ID of the provider' })
  @IsInt()
  @IsNotEmpty()
  providerId: number;

  @ApiProperty({ description: 'ID of the personal service type' })
  @IsInt()
  @IsNotEmpty()
  personalServiceTypeId: number;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  price: number;
}
