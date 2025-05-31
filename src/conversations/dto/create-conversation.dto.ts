import { IsEnum, IsInt, Min, IsNumber } from 'class-validator';
import { AdTypes, ConversationStatus } from '../entities/conversation.entity';
import { Type } from 'class-transformer';

export class CreateConversationDto {
  @IsEnum(AdTypes)
  adType: AdTypes;

  @IsInt()
  @Type(() => Number)
  adId: number;

  @IsEnum(ConversationStatus)
  status: ConversationStatus;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsInt()
  @Min(1)
  userFrom: number;
}
