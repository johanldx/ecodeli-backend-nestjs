import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLanguageDto {
  @ApiProperty({
    description: 'Code de la langue à ajouter',
    example: 'fr',
  })
  @IsString()
  lang: string;

  @ApiProperty({
    description: 'Traductions associées à la langue',
    type: Object,
  })
  @IsObject()
  translations: Record<string, any>;
}
