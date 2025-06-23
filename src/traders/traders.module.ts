import { Module } from '@nestjs/common';
import { TradersService } from './traders.service';
import { TradersController } from './traders.controller';
import { Trader } from './trader.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from 'src/storage/storage.service';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trader, AdPayment])],
  controllers: [TradersController],
  providers: [TradersService, StorageService],
  exports: [TradersService],
})
export class TradersModule {}
