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

@WebSocketGateway({ namespace: '/ws', cors: true })
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  afterInit(server: Server) {
    // éventuel logging
  }

  @SubscribeMessage('joinConversation')
  handleJoin(
    @MessageBody() payload: { conversationId: number },
    @ConnectedSocket() client: Socket
  ) {
    client.join(`conversation_${payload.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    // ici tu peux récupérer userId depuis client.handshake.auth ou un Guard WS
    const userId = client.handshake.auth.userId as number;
    const msg = await this.messagesService.create(dto, userId);
    this.server.to(`conversation_${dto.conversationId}`).emit('newMessage', msg);
    return { status: 'ok', messageId: msg.id };
  }
}
