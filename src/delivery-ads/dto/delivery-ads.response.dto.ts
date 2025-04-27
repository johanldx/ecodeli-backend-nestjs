import { ApiProperty } from '@nestjs/swagger';
import { AdStatus, PackageSize } from '../entities/delivery-ads.entity';
import { DeliveryAd } from '../entities/delivery-ads.entity';

export class DeliveryAdResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  imageUrls: string[];

  @ApiProperty({ type: String, format: 'date-time', description: 'Date de livraison' })
  deliveryDate: Date;

  @ApiProperty({ enum: PackageSize })
  packageSize: PackageSize;

  @ApiProperty()
  reference: string;

  @ApiProperty({ enum: AdStatus })
  status: AdStatus;

  @ApiProperty({ description: 'ID de l’utilisateur ayant posté l’annonce' })
  postedById: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  static fromEntity(ad: DeliveryAd): DeliveryAdResponseDto {
    const dto = new DeliveryAdResponseDto();
    dto.id = ad.id;
    dto.title = ad.title;
    dto.description = ad.description;
    dto.imageUrls = ad.imageUrls;
    dto.packageSize = ad.packageSize;
    dto.reference = ad.reference;
    dto.status = ad.status;
    dto.postedById = ad.postedBy.id;
    dto.createdAt = ad.createdAt;
    dto.updatedAt = ad.updatedAt;
    return dto;
  }
}
