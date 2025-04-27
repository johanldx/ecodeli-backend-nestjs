import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { DeliveryAdsService } from './delivery-ads.service';
import { CreateDeliveryAdDto } from './dto/create-delivery-ads.dto';
import { UpdateDeliveryAdDto } from './dto/update-delivery-ads.dto';
import { DeliveryAdResponseDto } from './dto/delivery-ads.response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdStatus } from './entities/delivery-ads.entity';

@ApiTags('Delivery Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-ads')
export class DeliveryAdsController {
  constructor(private readonly deliveryAdsService: DeliveryAdsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer une nouvelle annonce de livraison' })
  @ApiBody({ type: CreateDeliveryAdDto })
  @ApiResponse({ status: 201, type: DeliveryAdResponseDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateDeliveryAdDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<DeliveryAdResponseDto> {
    if (!images || images.length === 0) {
      throw new Error('Au moins une image est requise');
    }
    const reference = uuidv4();
    return this.deliveryAdsService.create(user.id, dto, reference, images);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les annonces de livraison' })
  @ApiQuery({ name: 'posted_by', required: false, type: Number })
  @ApiQuery({ name: 'delivery_date', required: false, type: String })
  @ApiResponse({ status: 200, type: [DeliveryAdResponseDto] })
  async findAll(@CurrentUser() user: User, @Query() query: any): Promise<DeliveryAdResponseDto[]> {
    return this.deliveryAdsService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une annonce par son ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: DeliveryAdResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<DeliveryAdResponseDto> {
    return this.deliveryAdsService.findOne(id, user);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mettre à jour une annonce (hors statut)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateDeliveryAdDto })
  @ApiResponse({ status: 200, type: DeliveryAdResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdateDeliveryAdDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<DeliveryAdResponseDto> {
    return this.deliveryAdsService.update(id, user, dto, images);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une annonce' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<void> {
    return this.deliveryAdsService.remove(id, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut (ADMIN only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { status: { type: 'string', enum: ['pending','in_progress','completed','cancelled'] } },
      required: ['status'],
    },
  })
  
  @ApiResponse({ status: 200, type: DeliveryAdResponseDto })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: AdStatus,
    @CurrentUser() user: User,
  ): Promise<DeliveryAdResponseDto> {
    return this.deliveryAdsService.updateStatus(id, status, user.id);
  }
}
