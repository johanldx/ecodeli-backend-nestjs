import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { ReleaseCartAd } from 'src/release-cart-ads/entities/release-cart-ad.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';
import { PersonalServiceAd } from 'src/personal-services-ads/personal-service-ad.entity';
import { RatingsModule } from 'src/ratings/ratings.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ShoppingAd,
      DeliveryAd,
      ReleaseCartAd,
      PersonalServiceAd,
    ]),
    RatingsModule,
    EmailModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
