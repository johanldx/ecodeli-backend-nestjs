import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsArray } from 'class-validator';
import { AdStatus } from 'src/delivery-ads/entities/delivery-ads.entity';
import { PackageSize } from 'src/shopping-ads/entities/shopping-ads.entity';

export class CreateShoppingAdDto {
  @ApiProperty({ description: 'The title of the shopping ad.' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the shopping ad.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The list of image URLs for the shopping ad.' })
  @IsArray()
  image_urls: string[];

  @ApiProperty({ description: 'The status of the shopping ad.', enum: AdStatus })
  @IsEnum(AdStatus)
  status: AdStatus;

  @ApiProperty({ description: 'The departure location ID for the shopping ad.' })
  @IsNumber()
  departure_location: number;

  @ApiProperty({ description: 'The arrival location ID for the shopping ad.' })
  @IsNumber()
  arrival_location: number;

  @ApiProperty({ description: 'The package size for the shopping ad.', enum: PackageSize })
  @IsEnum(PackageSize)
  package_size: PackageSize;

  @ApiProperty({ description: 'The shopping list in the ad.' })
  @IsArray()
  shopping_list: string[];

  @ApiProperty({ description: 'The price of the shopping ad.' })
  @IsNumber()
  price: number;
}
