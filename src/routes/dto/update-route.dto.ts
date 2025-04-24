import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRouteDto {
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
  @IsNotEmpty()
  day: Date;
}
