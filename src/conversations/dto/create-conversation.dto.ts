import { IsEnum, IsInt, Min, IsNumber } from 'class-validator';
import { AdTypes, ConversationStatus } from '../entities/conversation.entity';

export class CreateConversationDto {
  @IsEnum(AdTypes)
  adType: AdTypes;

  @IsInt()
  @Min(1)
  adId: number;

  @IsEnum(ConversationStatus)
  status: ConversationStatus;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  userFrom: number;
}
