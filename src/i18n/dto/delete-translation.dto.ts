import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteTranslationDto {
  @ApiProperty({
    description: 'Clé de traduction à supprimer',
    example: 'greeting.hello',
  })
  @IsString()
  key: string;
}
