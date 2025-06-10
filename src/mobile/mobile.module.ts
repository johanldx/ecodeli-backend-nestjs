import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryPerson } from 'src/delivery-persons/delivery-person.entity';
import { User } from 'src/users/user.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryPerson, DeliveryStep, ShoppingAd, User]),
  ],
  controllers: [MobileController],
  providers: [MobileService],
})
export class MobileModule {}
