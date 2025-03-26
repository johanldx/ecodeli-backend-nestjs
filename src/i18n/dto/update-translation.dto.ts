import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTranslationDto {
  @ApiProperty({
    description: 'Translation key to modify',
    example: 'greeting.hello',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'New value for the translation',
    example: 'Hello',
  })
  @IsString()
  value: string;
}
