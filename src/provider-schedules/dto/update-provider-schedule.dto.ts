import { PartialType } from '@nestjs/swagger';
import { CreateProviderScheduleDto } from './create-provider-schedule.dto';

export class UpdateProviderScheduleDto extends PartialType(
  CreateProviderScheduleDto,
) {}
