import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { User } from 'src/users/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';
import { PersonalServiceAd } from 'src/personal-services-ads/personal-service-ad.entity';
import { Message } from 'src/messages/entities/message.entity';
import { ReleaseCartAd } from 'src/release-cart-ads/entities/release-cart-ad.entity';
import { SubscriptionPayment } from 'src/subscription-payments/entities/subscription-payment.entity';
import { Subscription } from 'src/subscriptions/entities/subscriptions.entity';
import { Trader } from 'src/traders/trader.entity';
import { EmailModule } from 'src/email/email.module';
import { AdPaymentsModule } from 'src/ad-payments/ad-payments.module';
import { WalletsModule } from '../wallets/wallets.module';
import { I18nModule } from 'src/i18n/i18n.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      AdPayment,
      User,
      ShoppingAd,
      DeliveryAd,
      DeliveryStep,
      DeliveryAd,
      PersonalServiceAd,
      Message,
      ReleaseCartAd,
      SubscriptionPayment,
      Subscription,
      Trader
    ]),
    EmailModule,
    AdPaymentsModule,
    WalletsModule,
    I18nModule
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
