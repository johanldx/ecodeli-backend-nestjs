import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiProperty({ description: 'ID de la conversation' })
  @IsInt()
  @Min(1)
  conversationId: number;
}
