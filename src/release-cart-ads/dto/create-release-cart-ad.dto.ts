import {
  IsString,
  IsEnum,
  IsArray,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { AdStatus, PackageSize } from '../entities/release-cart-ad.entity';
import { Type } from 'class-transformer';

export class CreateReleaseCartAdDto {
  @IsString()
  title: string;

  @IsNumber()
  @Type(() => Number)
  posted_by: number;

  @IsString()
  description: string;

  @IsEmail()
  clientEmail: string;

  @IsArray()
  @IsOptional()
  imageUrls: string[];

  @IsEnum(AdStatus)
  status: AdStatus;

  @IsString()
  reference: string;

  @IsNumber()
  @Type(() => Number)
  departureLocation: number;

  @IsNumber()
  @Type(() => Number)
  arrivalLocation: number;

  @IsEnum(PackageSize)
  packageSize: PackageSize;

  @IsOptional()
  startTime: Date;

  @IsOptional()
  endTime: Date;

  @IsNumber()
  @Type(() => Number)
  price: number;
}
