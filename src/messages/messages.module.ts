import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { AuthModule } from 'src/auth/auth.module';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), AuthModule],
  providers: [MessagesService, MessagesGateway, WsJwtAuthGuard],
  controllers: [MessagesController],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
