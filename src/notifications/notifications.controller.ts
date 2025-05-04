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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une notification' })
  @ApiResponse({ status: 201, description: 'Notification créée.' })
  create(@Body() dto: CreateNotificationDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lister ses notifications' })
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une notification' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une notification' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNotificationDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.service.remove(id, user);
  }
}
