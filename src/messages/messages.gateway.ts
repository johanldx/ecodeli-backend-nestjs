import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { WsJwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';

@UseGuards(WsJwtAuthGuard)
@WebSocketGateway({ namespace: '/ws', cors: true })
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  afterInit(server: Server) {
    // Optionnel : log, metrics…
  }

  @SubscribeMessage('joinConversation')
  handleJoin(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation_${payload.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user.sub as number;
    const msg = await this.messagesService.create(dto, userId);
    this.server
      .to(`conversation_${dto.conversationId}`)
      .emit('newMessage', msg);
    return { status: 'ok', messageId: msg.id };
  }
}
