import { PartialType } from '@nestjs/swagger';
import { CreatePersonalServiceTypeAuthorizationDto } from './create-personal-service-type-authorization.dto';

export class UpdatePersonalServiceTypeAuthorizationDto extends PartialType(
  CreatePersonalServiceTypeAuthorizationDto,
) {}
