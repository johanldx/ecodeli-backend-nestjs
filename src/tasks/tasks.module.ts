import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, InvoiceLine } from 'src/invoices/entities/invoice.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { Provider } from 'src/providers/provider.entity';
import { User } from 'src/users/user.entity';
import { StorageService } from 'src/storage/storage.service';
import { EmailService } from 'src/email/email.service';
import { Reflector } from '@nestjs/core';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';

@Module({
  imports: [
    InvoicesModule,
    WalletTransactionsModule,
    TypeOrmModule.forFeature([Invoice, InvoiceLine, AdPayment, Provider, User]),
  ],
  providers: [TasksService, StorageService, EmailService, Reflector],
})
export class TasksModule {} 