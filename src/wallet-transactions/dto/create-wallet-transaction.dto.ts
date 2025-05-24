import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { WalletTransactionTypes } from '../entities/wallet-transaction-types.enum';

export class CreateWalletTransactionDto {
  @IsEnum(WalletTransactionTypes)
  type: WalletTransactionTypes;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @IsNumber()
  related_payment_id?: number;
}
