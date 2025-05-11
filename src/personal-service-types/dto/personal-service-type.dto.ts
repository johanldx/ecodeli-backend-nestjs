import { ApiProperty } from '@nestjs/swagger';

export class PersonalServiceTypeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Last update timestamp',
  })
  editedAt: Date;
}
