import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { IsAdmin } from 'src/auth/decorators/is-admin.decorator';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client successfully created.' })
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateClientDto, @CurrentUser() user: User) {
    return this.clientsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'List of clients' })
  @UseGuards(JwtAuthGuard)
  @IsAdmin()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @UseGuards(JwtAuthGuard)
  @IsAdmin()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id/onboarding')
  @ApiOperation({ summary: 'Mark onboarding as seen' })
  @ApiResponse({ status: 200, description: 'Onboarding status updated' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  markOnboardingAsSeen(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.clientsService.markOnboardingAsSeen(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Client deleted' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @IsAdmin()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }
}
