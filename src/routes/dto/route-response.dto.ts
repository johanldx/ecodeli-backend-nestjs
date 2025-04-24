import { ApiProperty } from '@nestjs/swagger';

export class RouteResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  delivery_person_id: number;

  @ApiProperty()
  departure_location: number;

  @ApiProperty()
  arrival_location: number;

  @ApiProperty()
  day: Date;
}
