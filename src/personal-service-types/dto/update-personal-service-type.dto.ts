import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePersonalServiceTypeDto } from './create-personal-service-type.dto';

export class UpdatePersonalServiceTypeDto extends PartialType(
  CreatePersonalServiceTypeDto,
) {}
