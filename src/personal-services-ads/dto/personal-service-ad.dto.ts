import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { AdStatus } from '../personal-service-ad.entity';

export class PersonalServiceAdDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.postedBy.id)
  postedById: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String], description: 'Array of image URLs' })
  imageUrls: string[];

  @ApiProperty({ enum: AdStatus })
  status: AdStatus;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.type.id)
  typeId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  editedAt: Date;
}
