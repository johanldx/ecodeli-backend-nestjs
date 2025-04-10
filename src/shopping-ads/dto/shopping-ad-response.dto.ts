import { ApiProperty } from '@nestjs/swagger';
import { AdStatus, PackageSize } from '../entities/shopping-ads.entity'; 
import { Location } from 'src/locations/entities/location.entity';
import { User } from 'src/users/user.entity';

export class ShoppingAdResponseDto {
  @ApiProperty({ description: 'The unique identifier for the shopping ad.' })
  id: number;

  @ApiProperty({ description: 'The user who posted the shopping ad.' })
  postedBy: User;

  @ApiProperty({ description: 'The user who received the shopping ad.' })
  receivedBy: User;

  @ApiProperty({ description: 'The title of the shopping ad.' })
  title: string;

  @ApiProperty({ description: 'A description of the shopping ad.' })
  description: string;

  @ApiProperty({ description: 'Image URLs related to the shopping ad.' })
  imageUrls: string[];

  @ApiProperty({ description: 'The status of the shopping ad.' })
  status: AdStatus;

  @ApiProperty({ description: 'The departure location for the shopping ad.' })
  departureLocation: Location;

  @ApiProperty({ description: 'The arrival location for the shopping ad.' })
  arrivalLocation: Location;

  @ApiProperty({ description: 'The package size for the shopping ad.' })
  packageSize: PackageSize;

  @ApiProperty({ description: 'The shopping list associated with the shopping ad.' })
  shoppingList: string[];

  @ApiProperty({ description: 'The price for the shopping ad.' })
  price: number;

  @ApiProperty({ description: 'Timestamp when the shopping ad was created.' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the shopping ad was last updated.' })
  updatedAt: Date;
}
