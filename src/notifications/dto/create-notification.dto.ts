import { IsInt, Min, IsString, Length } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @Min(1)
  conversationId: number;

  @IsInt()
  @Min(1)
  receiverId: number;

  @IsString()
  @Length(1, 2000)
  content: string;
}
