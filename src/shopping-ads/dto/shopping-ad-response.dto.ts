import { ApiProperty } from '@nestjs/swagger';
import { AdStatus, PackageSize } from '../entities/shopping-ads.entity';
import { User } from 'src/users/user.entity';
import { Location } from 'src/locations/entities/location.entity';

export class ShoppingAdResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: () => User })
  postedBy: User;

  @ApiProperty({ type: () => User })
  receivedBy: User;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  imageUrls: string[];

  @ApiProperty({ enum: AdStatus })
  status: AdStatus;

  @ApiProperty({ type: () => Location })
  departureLocation: Location;

  @ApiProperty({ type: () => Location })
  arrivalLocation: Location;

  @ApiProperty({ enum: PackageSize })
  packageSize: PackageSize;

  @ApiProperty({ type: [String] })
  shoppingList: string[];

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
