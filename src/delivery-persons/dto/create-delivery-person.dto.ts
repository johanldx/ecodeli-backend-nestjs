import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDeliveryPersonDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  user_id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bank_account?: string;

  @ApiPropertyOptional({
    description: 'URL to identity card document stored in S3',
  })
  @IsString()
  @IsOptional()
  identity_card_document?: string;

  @ApiPropertyOptional({
    description: 'URL to driver license document stored in S3',
  })
  @IsString()
  @IsOptional()
  driver_license_document?: string;
}
