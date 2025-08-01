import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ConversationStatus } from '../entities/conversation.entity';
import { CreateConversationDto } from './create-conversation.dto';
import { Type } from 'class-transformer';

export class UpdateConversationDto extends PartialType(CreateConversationDto) {
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  readonly providerScheduleId?: number;
}
