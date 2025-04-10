import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsArray,
    IsDateString,
    IsUUID,
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
    image_urls: string[];
  
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    reference: string;
  
    @ApiProperty()
    @IsUUID()
    departure_location_id: string;
  
    @ApiProperty()
    @IsUUID()
    arrival_location_id: string;
  
    @ApiProperty()
    @IsDateString()
    delivery_date: Date;
  
    @ApiProperty({ enum: PackageSize })
    @IsEnum(PackageSize)
    package_size: PackageSize;
  }
  