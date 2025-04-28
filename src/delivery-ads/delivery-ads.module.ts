// src/delivery-ads/delivery-ads.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryAd } from './entities/delivery-ads.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';

import { DeliveryAdsService } from './delivery-ads.service';
import { DeliveryAdsController } from './delivery-ads.controller';

import { StorageModule } from 'src/storage/storage.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryAd, DeliveryStep]),
    StorageModule,
  ],
  controllers: [DeliveryAdsController],
  providers: [DeliveryAdsService],
})
export class DeliveryAdsModule {}
