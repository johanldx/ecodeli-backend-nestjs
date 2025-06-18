import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdPayment } from './entities/ad-payment.entity';
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { AdPaymentsService } from './ad-payments.service';
import { AdPaymentsController } from './ad-payments.controller';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdPayment, WalletTransaction, Wallet]),
    WalletsModule,
  ],
  controllers: [AdPaymentsController],
  providers: [AdPaymentsService],
})
export class AdPaymentsModule {}
