import { Controller, Post, Body, Get, Param, Query, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DeliveryStepsService } from './delivery-steps.service';
import { CreateDeliveryStepDto } from './dto/create-delivery-step.dto';
import { UpdateDeliveryStepDto } from './dto/update-delivery-step.dto';
import { DeliveryStepStatus } from './entities/delivery-step.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'; 
import { User } from 'src/users/user.entity';

@ApiTags('Delivery Steps')
@ApiBearerAuth()
@Controller('delivery-steps')
export class DeliveryStepsController {
  constructor(private readonly stepsService: DeliveryStepsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Étape de livraison créée avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async create(@Body() dto: CreateDeliveryStepDto, @CurrentUser() user: User) {
    return this.stepsService.create(dto, user);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retourne la liste des étapes de livraison' })
  async findAll(@Query() query: any) {
    return this.stepsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retourne l\'étape de livraison demandée' })
  async findOne(@Param('id') id: number) {
    return this.stepsService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Étape de livraison mise à jour avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async update(@Param('id') id: number, @Body() dto: UpdateDeliveryStepDto, @CurrentUser() user: User) {
    return this.stepsService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Étape de livraison supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async remove(@Param('id') id: number, @CurrentUser() user: User) {
    return this.stepsService.remove(id, user);
  }
}
