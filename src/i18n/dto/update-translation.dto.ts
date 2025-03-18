import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTranslationDto {
  @ApiProperty({
    description: 'Clé de traduction à mettre à jour',
    example: 'greeting.hello',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Nouvelle valeur pour la clé de traduction',
    example: 'Bonjour',
  })
  @IsString()
  value: string;
}
