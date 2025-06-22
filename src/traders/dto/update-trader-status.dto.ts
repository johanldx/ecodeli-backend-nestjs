import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ValidationStatus } from '../trader.entity';

export class UpdateTraderStatusDto {
  @ApiProperty({
    description: 'Status of the trader',
    enum: ValidationStatus,
    example: ValidationStatus.APPROVED,
  })
  @IsEnum(ValidationStatus)
  status: ValidationStatus;

  @ApiProperty({
    description: 'Reduction percentage (0-100)',
    example: 15,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reduction_percent?: number;
}
