import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsDateString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdStatus, PackageSize } from '../entities/delivery-ads.entity';

export class CreateDeliveryAdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  image_urls: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  reference: string;

  @ApiProperty()
  @IsDateString()
  delivery_date: Date;

  @ApiProperty({ enum: PackageSize })
  @IsEnum(PackageSize)
  package_size: PackageSize;
}
