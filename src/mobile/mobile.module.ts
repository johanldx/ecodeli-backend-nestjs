import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryPerson } from 'src/delivery-persons/delivery-person.entity';
import { User } from 'src/users/user.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { WalletsModule } from 'src/wallets/wallets.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryPerson, DeliveryStep, ShoppingAd, User, AdPayment]),
    WalletsModule,
    EmailModule,
  ],
  controllers: [MobileController],
  providers: [MobileService],
})
export class MobileModule {}
