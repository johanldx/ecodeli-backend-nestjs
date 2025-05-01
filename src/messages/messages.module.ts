import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
