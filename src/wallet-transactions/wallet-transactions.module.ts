import { Module } from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import { WalletTransactionsController } from './wallet-transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletTransaction, Wallet])],
  controllers: [WalletTransactionsController],
  providers: [WalletTransactionsService],
})
export class WalletTransactionsModule {}
