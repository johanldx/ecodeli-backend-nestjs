import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePersonalServiceTypeDto {
  @ApiProperty({ description: 'Name of the personal service type' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
