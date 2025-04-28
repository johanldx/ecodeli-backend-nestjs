import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AdStatus, PackageSize } from '../entities/shopping-ads.entity';
import { Transform, Type } from 'class-transformer';

export class CreateShoppingAdDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  posted_by: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  receive_by?: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  imageUrls: string[];

  @ApiProperty({ enum: AdStatus, default: AdStatus.PENDING, required: false })
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  departureLocationId: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  arrivalLocationId: number;

  @ApiProperty({ enum: PackageSize })
  @IsEnum(PackageSize)
  packageSize: PackageSize;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  shoppingList: string[];

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  price: number;
}
