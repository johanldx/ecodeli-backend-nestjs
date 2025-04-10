import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAd } from './entities/delivery-ads.entity';
import { DeliveryAdsService } from './delivery-ads.service';
import { DeliveryAdsController } from './delivery-ads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAd])],
  controllers: [DeliveryAdsController],
  providers: [DeliveryAdsService],
})
export class DeliveryAdsModule {}
