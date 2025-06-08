import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreatePersonalServiceTypeDto {
  @ApiProperty({ description: 'Name of the personal service type' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  price: number;
}
