import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { GetMessagesDto } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.entity';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupère les messages d’une conversation' })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages récupérés avec succès.',
    type: [Message],
  })
  @ApiResponse({
    status: 401,
    description: 'Utilisateur non authentifié.',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès refusé.',
  })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    description:
      'Identifiant de la conversation pour laquelle récupérer les messages.',
  })
  findByConversation(
    @Query() { conversationId }: GetMessagesDto,
    @CurrentUser() user: User,
  ) {
    return this.service.findByConversation(conversationId, user.id);
  }
}
