import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { User } from 'src/users/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      AdPayment,
      User
    ]),
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
