import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 1, description: 'ID of the associated user' })
  @IsInt()
  user_id: number;
}
