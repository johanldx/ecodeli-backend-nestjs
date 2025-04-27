import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryStepsService } from './delivery-steps.service';
import { DeliveryStepsController } from './delivery-steps.controller';
import { DeliveryStep } from './entities/delivery-step.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { Location } from 'src/locations/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryStep, DeliveryAd, Location])],
  controllers: [DeliveryStepsController],
  providers: [DeliveryStepsService],
})
export class DeliveryStepsModule {}
