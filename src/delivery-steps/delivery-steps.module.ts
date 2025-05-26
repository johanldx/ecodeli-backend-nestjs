import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryStepsService } from './delivery-steps.service';
import { DeliveryStepsController } from './delivery-steps.controller';
import { DeliveryStep } from './entities/delivery-step.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Route } from 'src/routes/entities/route.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryStep, DeliveryAd, Location, Route]),
    EmailModule,
  ],
  controllers: [DeliveryStepsController],
  providers: [DeliveryStepsService],
  exports: [DeliveryStepsService],
})
export class DeliveryStepsModule {}
