import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPaymentsService } from './subscription-payments.service';
import { SubscriptionPaymentsController } from './subscription-payments.controller';
import { SubscriptionPayment } from './entities/subscription-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPayment])],
  controllers: [SubscriptionPaymentsController],
  providers: [SubscriptionPaymentsService],
})
export class SubscriptionPaymentsModule {}
