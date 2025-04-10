import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [InvoicesController],
  providers: [InvoicesService, StorageService],
})
export class InvoicesModule {}
