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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { DeliveryStepsService } from './delivery-steps.service';
import { CreateDeliveryStepDto } from './dto/create-delivery-step.dto';
import { UpdateDeliveryStepDto } from './dto/update-delivery-step.dto';
import { DeliveryStepResponseDto } from './dto/delivery-step-response.dto';
import { DeliveryStep } from './entities/delivery-step.entity';
import { DeliveryStepStatus } from './entities/delivery-step.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from 'src/routes/entities/route.entity';
import { Location } from 'src/locations/entities/location.entity';
import { EmailService } from 'src/email/email.service';

@ApiTags('Delivery Steps')
@ApiBearerAuth()
@Controller('delivery-steps')
export class DeliveryStepsController {
  constructor(
    private readonly stepsService: DeliveryStepsService,
    @InjectRepository(Route)
    public readonly routeRepo: Repository<Route>,
    @InjectRepository(Location)
    public readonly locationRepo: Repository<Location>,
    private emailService: EmailService,
  ) {}

  private toDto(step: DeliveryStep): DeliveryStepResponseDto {
    return {
      id: step.id,
      receivedById: step.receivedBy?.id,
      deliveryAdId: step.deliveryAd.id,
      stepNumber: step.stepNumber,
      price: step.price,
      status: step.status,
      departureLocationId: step.departureLocation.id,
      arrivalLocationId: step.arrivalLocation.id,
      createdAt: step.createdAt,
      updatedAt: step.updatedAt,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Créer une étape de livraison' })
  @ApiBody({ type: CreateDeliveryStepDto })
  @ApiCreatedResponse({
    type: DeliveryStepResponseDto,
    description: 'Étape créée',
  })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async create(
    @Body() dto: CreateDeliveryStepDto,
    @CurrentUser() user: User,
  ): Promise<DeliveryStepResponseDto> {
    const departureLocation = await this.locationRepo.findOne({
      where: { id: dto.departureLocationId },
    });
    const arrivalLocation = await this.locationRepo.findOne({
      where: { id: dto.arrivalLocationId },
    });

    if (!departureLocation || !arrivalLocation) {
      throw new Error('Locations de départ ou d\'arrivée invalides');
    }

    const routeMatch = await this.routeRepo
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.deliveryPerson', 'deliveryPerson')
      .innerJoinAndSelect('deliveryPerson.user', 'user')
      .innerJoinAndSelect('route.departureLocationEntity', 'departureLoc')
      .innerJoinAndSelect('route.arrivalLocationEntity', 'arrivalLoc')
      .where('departureLoc.city = :depCity', {
        depCity: departureLocation.city,
      })
      .andWhere('arrivalLoc.city = :arrCity', { arrCity: arrivalLocation.city })
      .getMany();

    if (routeMatch && routeMatch.length > 0) {
      const uniqueEmails = new Set<string>();

      for (const route of routeMatch) {
        const email = route.deliveryPerson?.user?.email;
        if (email && !uniqueEmails.has(email)) {
          uniqueEmails.add(email);

          const emailContent = `
              <p><strong>Une ou plusieurs nouvelles annonces ont été publiées et correspond à un trajet que vous avez prévu.</strong></p>
              <p>Nous sommes heureux de vous compter parmi les membres de notre plateforme.</p>
              <p>Merci de vous connecter rapidement pour consulter les annonces correspondantes en ligne.</p>
            `;

          await this.emailService.sendEmail(
            email,
            'Annonce correspondant à votre trajet',
            'Annonce correspondant à votre trajet',
            emailContent,
          );
        }
      }
    }

    const step = await this.stepsService.create(dto, user);
    return this.toDto(step);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les étapes de livraison' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DeliveryStepStatus,
    description: 'Filtrer par statut',
  })
  @ApiOkResponse({ type: DeliveryStepResponseDto, isArray: true })
  async findAll(@Query() query: any): Promise<DeliveryStepResponseDto[]> {
    const steps = await this.stepsService.findAll(query);
    return steps.map((s) => this.toDto(s));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une étape par ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l’étape' })
  @ApiOkResponse({ type: DeliveryStepResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeliveryStepResponseDto> {
    const step = await this.stepsService.findOne(id);
    return this.toDto(step);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une étape de livraison' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l’étape' })
  @ApiBody({ type: UpdateDeliveryStepDto })
  @ApiOkResponse({ type: DeliveryStepResponseDto })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryStepDto,
    @CurrentUser() user: User,
  ): Promise<DeliveryStepResponseDto> {
    const step = await this.stepsService.update(id, dto, user);
    return this.toDto(step);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une étape de livraison' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de l’étape' })
  @ApiResponse({ status: 200, description: 'Étape supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.stepsService.remove(id, user);
  }

  @Get('delivery-ad/:deliveryAdId')
  @ApiOperation({ summary: 'Lister les étapes par annonce de livraison' })
  @ApiParam({
    name: 'deliveryAdId',
    type: Number,
    description: 'ID de l’annonce de livraison',
  })
  @ApiOkResponse({ type: DeliveryStepResponseDto, isArray: true })
  async findByDeliveryAd(
    @Param('deliveryAdId', ParseIntPipe) deliveryAdId: number,
  ): Promise<DeliveryStepResponseDto[]> {
    const steps = await this.stepsService.findByDeliveryAd(deliveryAdId);
    return steps.map((s) => this.toDto(s));
  }
}
