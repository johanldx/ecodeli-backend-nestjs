import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  content?: string;
}
