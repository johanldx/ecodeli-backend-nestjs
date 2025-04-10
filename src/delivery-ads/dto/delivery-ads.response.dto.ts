import { ApiProperty } from '@nestjs/swagger';
import { AdStatus, PackageSize } from '../entities/delivery-ads.entity';

export class DeliveryAdResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  image_urls: string[];

  @ApiProperty()
  reference: string;

  @ApiProperty()
  departure_location_id: string;

  @ApiProperty()
  arrival_location_id: string;

  @ApiProperty()
  delivery_date: Date;

  @ApiProperty({ enum: PackageSize })
  package_size: PackageSize;

  @ApiProperty({ enum: AdStatus })
  status: AdStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  edited_at: Date;
}
