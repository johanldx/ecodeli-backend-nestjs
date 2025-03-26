import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteTranslationDto {
  @ApiProperty({
    description: 'Translation key to delete',
    example: 'greeting.hello',
  })
  @IsString()
  key: string;
}
