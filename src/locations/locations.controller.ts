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
  HttpCode,
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@ApiTags('locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une nouvelle adresse' })
  @ApiResponse({ status: 201, description: 'Adresse créée avec succès', type: Location })
  @ApiResponse({ status: 403, description: 'Non autorisé à définir public ou price' })
  create(@Body() dto: CreateLocationDto, @CurrentUser() user: User): Promise<Location> {
    return this.locationsService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer les adresses de l’utilisateur (ou publiques)' })
  @ApiResponse({ status: 200, description: 'Liste des adresses récupérée', type: [Location] })
  findAll(@CurrentUser() user: User): Promise<Location[]> {
    return this.locationsService.findAll(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer une adresse spécifique' })
  @ApiResponse({ status: 200, description: 'Adresse récupérée', type: Location })
  @ApiResponse({ status: 403, description: 'Non autorisé à consulter cette ressource' })
  @ApiResponse({ status: 404, description: 'Adresse introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<Location> {
    return this.locationsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse mise à jour', type: Location })
  @ApiResponse({ status: 403, description: 'Non autorisé à modifier cette ressource' })
  @ApiResponse({ status: 404, description: 'Adresse introuvable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLocationDto,
    @CurrentUser() user: User,
  ): Promise<Location> {
    return this.locationsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer une adresse' })
  @ApiResponse({ status: 200, description: 'Adresse supprimée' })
  @ApiResponse({ status: 403, description: 'Non autorisé à supprimer cette ressource' })
  @ApiResponse({ status: 404, description: 'Adresse introuvable' })
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<void> {
    return this.locationsService.remove(id, user);
  }
}
