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

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceLine, AdPayment, Provider, User]),
    StorageModule,
    AdPaymentsModule,
    UsersModule,
    ProvidersModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
