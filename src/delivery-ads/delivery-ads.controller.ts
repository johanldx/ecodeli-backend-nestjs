import { Controller, Post, Body, Get, Param, Query, Delete, Patch } from '@nestjs/common';
import { AdStatus } from './entities/delivery-ads.entity'; // Adjust the path as needed
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DeliveryAdsService } from './delivery-ads.service';
import { CreateDeliveryAdDto } from './dto/create-delivery-ads.dto';
import { UpdateDeliveryAdDto } from './dto/update-delivery-ads.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';  // On importe seulement le décorateur
import { User } from 'src/users/user.entity';  // Cette importation est juste si nécessaire pour d'autres fonctionnalités

@ApiTags('Delivery Ads')
@ApiBearerAuth()
@Controller('delivery-ads')
export class DeliveryAdsController {
  constructor(private readonly deliveryAdsService: DeliveryAdsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Annonce de livraison créée avec succès' })
  async create(@Body() dto: CreateDeliveryAdDto, @CurrentUser() user: User) {
    return this.deliveryAdsService.create(dto, user);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retourne la liste des annonces de livraison' })
  async findAll(@Query() query: any, @CurrentUser() user: User) {
    return this.deliveryAdsService.findAll(user, query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retourne l\'annonce de livraison demandée' })
  async findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.deliveryAdsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Annonce de livraison mise à jour avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async update(@Param('id') id: number, @Body() dto: UpdateDeliveryAdDto, @CurrentUser() user: User) {
    return this.deliveryAdsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Annonce de livraison supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async remove(@Param('id') id: number, @CurrentUser() user: User) {
    return this.deliveryAdsService.remove(id, user);
  }

  @Patch(':id/status')
  @ApiResponse({ status: 200, description: 'Statut de l\'annonce mis à jour avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async updateStatus(@Param('id') id: number, @Body() status: 'active' | 'inactive', @CurrentUser() user: User) {
    return this.deliveryAdsService.updateStatus(id, status as AdStatus, user);
  }
}
