import { ApiProperty } from '@nestjs/swagger';
import { ProviderScheduleStatus } from '../provider-schedule.entity';

export class ProviderScheduleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  providerId: number;

  @ApiProperty()
  personalServiceTypeId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  startTime: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endTime: Date;

  @ApiProperty({ enum: ProviderScheduleStatus })
  status: ProviderScheduleStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  editedAt: Date;
}
