import { IsInt, Min, IsString, Length } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @Min(1)
  conversationId: number;

  @IsString()
  @Length(1, 2000)
  content: string;
}
