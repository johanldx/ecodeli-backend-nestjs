import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { ReleaseCartAd } from 'src/release-cart-ads/entities/release-cart-ad.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ShoppingAd,
      DeliveryAd,
      ReleaseCartAd,
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
