import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ValidationStatus } from '../trader.entity';
import { Type } from 'class-transformer';

export class CreateTraderDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  user_id: number;

  
  @ApiProperty({ description: 'Bank account number (optional)', required: false })
  @IsString()
  @IsOptional()
  bank_account: string;

  @ApiProperty({ description: 'URL to identity card document stored in S3', required: true })
  @IsString()
  @IsOptional()
  identity_card_document: string;

  @ApiProperty({ description: 'URL to business document stored in S3', required: true })
  @IsString()
  @IsOptional()
  proof_of_business_document: string;
}
