import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString, IsEnum } from 'class-validator';
import { ProviderScheduleStatus } from '../provider-schedule.entity';

export class CreateProviderScheduleDto {
  @ApiProperty({ description: 'ID of the provider' })
  @IsInt()
  providerId: number;

  @ApiProperty({ description: 'ID of the personal service type' })
  @IsInt()
  personalServiceTypeId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  endTime: Date;

  @ApiProperty({ enum: ProviderScheduleStatus })
  @IsEnum(ProviderScheduleStatus)
  status: ProviderScheduleStatus;
}
