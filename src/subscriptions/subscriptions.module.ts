import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscriptions.entity';
import { SubscriptionPayment } from '../subscription-payments/entities/subscription-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, SubscriptionPayment])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
