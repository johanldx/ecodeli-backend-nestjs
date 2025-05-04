import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.entity';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly service: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une conversation' })
  @ApiResponse({ status: 201, description: 'Conversation créée.' })
  create(@Body() dto: CreateConversationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister ses conversations' })
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une conversation' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une conversation' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConversationDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une conversation' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.remove(id, user.id);
  }
}
