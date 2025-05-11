import { PartialType } from '@nestjs/swagger';
import { CreatePersonalServiceAdDto } from './create-personal-service-ad.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AdStatus } from '../personal-service-ad.entity';

export class UpdatePersonalServiceAdDto extends PartialType(
  CreatePersonalServiceAdDto,
) {
  @ApiPropertyOptional({ enum: AdStatus })
  @IsEnum(AdStatus)
  status?: AdStatus;
}
