import { ApiProperty } from '@nestjs/swagger';

export class PersonalServiceTypeAuthorizationDto {
  @ApiProperty()
  providerId: number;

  @ApiProperty()
  personalServiceTypeId: number;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  editedAt: Date;
}
