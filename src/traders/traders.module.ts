import { Module } from '@nestjs/common';
import { TradersService } from './traders.service';
import { TradersController } from './traders.controller';
import { Trader } from './trader.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trader])],
  controllers: [TradersController],
  providers: [TradersService, StorageService],
  exports: [TradersService],
})
export class TradersModule {}
