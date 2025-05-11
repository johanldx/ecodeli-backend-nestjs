import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreatePersonalServiceAdDto {
  @ApiProperty({ description: 'Title of the ad' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the ad' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'ID of the service type', example: 1 })
  @IsInt()
  typeId: number;
}
