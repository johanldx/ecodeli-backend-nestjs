import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { AdStatus } from 'src/delivery-ads/entities/delivery-ads.entity';
import { PackageSize } from '../entities/shopping-ads.entity';

export class UpdateShoppingAdDto {
  @ApiProperty({ description: 'The title of the shopping ad.' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'A description of the shopping ad.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URLs related to the shopping ad.' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @ApiProperty({ description: 'The status of the shopping ad.' })
  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus;

  @ApiProperty({ description: 'The departure location ID for the shopping ad.' })
  @IsNumber()
  @IsOptional()
  departureLocation?: number;

  @ApiProperty({ description: 'The arrival location ID for the shopping ad.' })
  @IsNumber()
  @IsOptional()
  arrivalLocation?: number;

  @ApiProperty({ description: 'The package size for the shopping ad.' })
  @IsEnum(PackageSize)
  @IsOptional()
  packageSize?: PackageSize;

  @ApiProperty({ description: 'The shopping list associated with the shopping ad.' })
  @IsArray()
  @IsOptional()
  shoppingList?: string[];

  @ApiProperty({ description: 'The price of the shopping ad.' })
  @IsNumber()
  @IsOptional()
  price?: number;
}
