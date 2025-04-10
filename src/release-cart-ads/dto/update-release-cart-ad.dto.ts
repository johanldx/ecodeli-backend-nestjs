import { IsString, IsEnum, IsArray, IsEmail, IsNumber, IsOptional } from 'class-validator';
import { AdStatus, PackageSize } from '../entities/release-cart-ad.entity';

export class UpdateReleaseCartAdDto {
  @IsOptional()
  @IsString()
  title?: string;

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
