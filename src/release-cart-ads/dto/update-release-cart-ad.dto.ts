import {
  IsString,
  IsEnum,
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { AdStatus, PackageSize } from '../entities/release-cart-ad.entity';
import { Type } from 'class-transformer';

export class UpdateReleaseCartAdDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsNumber()
  @Type(() => Number)
  posted_by?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsNumber()
  departureLocation?: number;

  @IsOptional()
  @IsNumber()
  arrivalLocation?: number;

  @IsOptional()
  @IsEnum(PackageSize)
  packageSize?: PackageSize;

  @IsOptional()
  startTime?: Date;

  @IsOptional()
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  price?: number;
}
