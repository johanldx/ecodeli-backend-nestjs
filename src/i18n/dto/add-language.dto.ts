import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLanguageDto {
  @ApiProperty({
    description: 'Code of the language to add',
    example: 'fr',
  })
  @IsString()
  lang: string;

  @ApiProperty({
    description: 'Translations associated with the language',
    type: Object,
  })
  @IsObject()
  translations: Record<string, any>;
}
