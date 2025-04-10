import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle adresse' })
  @ApiResponse({ status: 201, description: 'Adresse créée avec succès', type: Location })
  @ApiResponse({ status: 403, description: 'Non autorisé à définir public ou price' })
  create(@Body() dto: CreateLocationDto, @Request() req): Promise<Location> {
    return this.locationsService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer les adresses de l’utilisateur (ou publiques)' })
  @ApiResponse({ status: 200, description: 'Liste des adresses récupérée', type: [Location] })
  findAll(@Request() req): Promise<Location[]> {
    return this.locationsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une adresse spécifique' })
  @ApiResponse({ status: 200, description: 'Adresse récupérée', type: Location })
  @ApiResponse({ status: 403, description: 'Non autorisé à consulter cette ressource' })
  @ApiResponse({ status: 404, description: 'Adresse introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Location> {
    return this.locationsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse mise à jour', type: Location })
  @ApiResponse({ status: 403, description: 'Non autorisé à modifier cette ressource' })
  @ApiResponse({ status: 404, description: 'Adresse introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocationDto,
    @Request() req,
  ): Promise<Location> {
    return this.locationsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse supprimée' })
  @ApiResponse({ status: 403, description: 'Non autorisé à supprimer cette ressource' })
  @ApiResponse({ status: 404, description: 'Adresse introuvable' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.locationsService.remove(id, req.user);
  }
}
