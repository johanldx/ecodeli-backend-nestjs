import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTraderDto {
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
