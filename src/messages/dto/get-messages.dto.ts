import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetMessagesDto {
  @ApiProperty({ description: 'ID de la conversation' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  conversationId: number;
}
