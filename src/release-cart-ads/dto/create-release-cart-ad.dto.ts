import { IsString, IsEnum, IsArray, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { AdStatus, PackageSize } from '../entities/release-cart-ad.entity';

export class CreateReleaseCartAdDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEmail()
  clientEmail: string;

  @IsArray()
  imageUrls: string[];

  @IsEnum(AdStatus)
  status: AdStatus;

  @IsString()
  reference: string;

  @IsNumber()
  departureLocation: number;

  @IsNumber()
  arrivalLocation: number;

  @IsEnum(PackageSize)
  packageSize: PackageSize;

  @IsOptional()
  startTime: Date;

  @IsOptional()
  endTime: Date;

  @IsNumber()
  price: number;
}
