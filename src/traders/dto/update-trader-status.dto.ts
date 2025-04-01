import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ValidationStatus } from '../trader.entity';

export class UpdateTraderStatusDto {
  @ApiProperty({ description: 'New status for the trader', enum: ValidationStatus })
  @IsEnum(ValidationStatus)
  status: ValidationStatus;
}
