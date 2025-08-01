import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice, InvoiceLine } from './entities/invoice.entity';
import { StorageModule } from '../storage/storage.module';
import { AdPaymentsModule } from '../ad-payments/ad-payments.module';
import { UsersModule } from '../users/users.module';
import { ProvidersModule } from '../providers/providers.module';
import { AdPayment } from '../ad-payments/entities/ad-payment.entity';
import { Provider } from '../providers/provider.entity';
import { User } from '../users/user.entity';
import { EmailModule } from '../email/email.module';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceLine, AdPayment, Provider, User]),
    StorageModule,
    AdPaymentsModule,
    UsersModule,
    ProvidersModule,
    EmailModule,
    WalletTransactionsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
