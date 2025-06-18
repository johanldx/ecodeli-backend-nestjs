import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../conversations/entities/conversation.entity';
import { AdPayment } from '../ad-payments/entities/ad-payment.entity';
import { ShoppingAd } from '../shopping-ads/entities/shopping-ads.entity';
import { DeliveryStep } from '../delivery-steps/entities/delivery-step.entity';
import { ReleaseCartAd } from '../release-cart-ads/entities/release-cart-ad.entity';
import { PersonalServiceAd } from '../personal-services-ads/personal-service-ad.entity';
import { User } from '../users/user.entity';
import { EmailModule } from '../email/email.module';
import { OrderTrackingController } from './order-tracking.controller';
import { OrderTrackingService } from './order-tracking.service';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      AdPayment,
      ShoppingAd,
      DeliveryStep,
      ReleaseCartAd,
      PersonalServiceAd,
      User,
    ]),
    EmailModule,
    WalletsModule,
  ],
  controllers: [OrderTrackingController],
  providers: [OrderTrackingService],
})
export class OrderTrackingModule {} 