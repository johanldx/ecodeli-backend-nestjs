import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateRouteDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  delivery_person_id: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  departure_location: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  arrival_location: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  day: string;
}
