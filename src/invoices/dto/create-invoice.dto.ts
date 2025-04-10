import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  providerId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  userId: number;
}
