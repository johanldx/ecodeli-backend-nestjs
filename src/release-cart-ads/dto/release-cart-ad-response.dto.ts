import { ApiProperty } from '@nestjs/swagger';
import { AdStatus } from '../entities/release-cart-ad.entity'; // Assure-toi d'utiliser le bon path pour AdStatus
import { User } from 'src/users/user.entity';
import { Location } from 'src/locations/entities/location.entity';

export class ReleaseCartAdResponseDto {
  @ApiProperty({ description: 'The unique identifier for the Release Cart Ad' })
  id: number;

  @ApiProperty({ description: 'The title of the Release Cart Ad' })
  title: string;

  @ApiProperty({ description: 'A detailed description of the Release Cart Ad' })
  description: string;

  @ApiProperty({ description: 'URLs of images associated with the Release Cart Ad' })
  imageUrls: string[];

  @ApiProperty({ description: 'The status of the Release Cart Ad', enum: AdStatus })
  status: AdStatus;

  @ApiProperty({ description: 'The reference code for the Release Cart Ad' })
  reference: string;

  @ApiProperty({ description: 'The departure location of the Release Cart Ad', type: Location })
  departureLocation: Location;

  @ApiProperty({ description: 'The arrival location of the Release Cart Ad', type: Location })
  arrivalLocation: Location;

  @ApiProperty({ description: 'The user who posted the Release Cart Ad', type: User })
  postedBy: User;

  @ApiProperty({ description: 'Timestamp when the Release Cart Ad was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the Release Cart Ad was last updated' })
  updatedAt: Date;
}
