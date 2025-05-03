import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeliveryStep,
  DeliveryStepStatus,
} from './entities/delivery-step.entity';
import { CreateDeliveryStepDto } from './dto/create-delivery-step.dto';
import { UpdateDeliveryStepDto } from './dto/update-delivery-step.dto';
import { User } from 'src/users/user.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { Location } from 'src/locations/entities/location.entity';

@Injectable()
export class DeliveryStepsService {
  constructor(
    @InjectRepository(DeliveryStep)
    private readonly stepRepo: Repository<DeliveryStep>,
    @InjectRepository(DeliveryAd)
    private readonly deliveryAdRepo: Repository<DeliveryAd>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async create(dto: CreateDeliveryStepDto, user: User): Promise<DeliveryStep> {
    const deliveryAd = await this.deliveryAdRepo.findOne({
      where: { id: dto.deliveryAdId },
    });
    if (!deliveryAd)
      throw new NotFoundException('Annonce de livraison introuvable');

    const departure = await this.locationRepo.findOne({
      where: { id: dto.departureLocationId },
    });
    if (!departure)
      throw new NotFoundException('Localisation de départ introuvable');

    const arrival = await this.locationRepo.findOne({
      where: { id: dto.arrivalLocationId },
    });
    if (!arrival)
      throw new NotFoundException('Localisation d’arrivée introuvable');

    const step = this.stepRepo.create({
      ...dto,
      status: dto.status ?? DeliveryStepStatus.PENDING,
      receivedBy: user,
      deliveryAd,
      departureLocation: departure,
      arrivalLocation: arrival,
    });

    return this.stepRepo.save(step);
  }

  async findAll(query: any): Promise<DeliveryStep[]> {
    const qb = this.stepRepo
      .createQueryBuilder('step')
      .leftJoinAndSelect('step.receivedBy', 'receivedBy')
      .leftJoinAndSelect('step.deliveryAd', 'deliveryAd')
      .leftJoinAndSelect('step.departureLocation', 'departure')
      .leftJoinAndSelect('step.arrivalLocation', 'arrival');

    if (query.status) {
      qb.andWhere('step.status = :status', { status: query.status });
    }

    return qb.getMany();
  }

  async findByDeliveryAd(deliveryAdId: number): Promise<DeliveryStep[]> {
    const steps = await this.stepRepo.find({
      where: { deliveryAd: { id: deliveryAdId } },
      relations: [
        'receivedBy',
        'deliveryAd',
        'departureLocation',
        'arrivalLocation',
      ],
    });

    if (!steps.length) {
      throw new NotFoundException('Aucune étape trouvée pour cette annonce');
    }

    return steps;
  }

  async findOne(id: number): Promise<DeliveryStep> {
    const step = await this.stepRepo.findOne({
      where: { id },
      relations: [
        'receivedBy',
        'deliveryAd',
        'departureLocation',
        'arrivalLocation',
      ],
    });

    if (!step) throw new NotFoundException('Étape introuvable');
    return step;
  }

  async update(
    id: number,
    dto: UpdateDeliveryStepDto,
    user: User,
  ): Promise<DeliveryStep> {
    const step = await this.findOne(id);

    if (dto.status) {
      throw new ForbiddenException(
        'Le statut ne peut être mis à jour que via la route dédiée',
      );
    }

    if (step.receivedBy?.id !== user.id && !user.administrator) {
      throw new ForbiddenException('Non autorisé à modifier cette étape');
    }

    if (dto.departureLocationId) {
      const departure = await this.locationRepo.findOne({
        where: { id: dto.departureLocationId },
      });
      if (!departure)
        throw new NotFoundException('Localisation de départ introuvable');
      step.departureLocation = departure;
    }
    if (dto.arrivalLocationId) {
      const arrival = await this.locationRepo.findOne({
        where: { id: dto.arrivalLocationId },
      });
      if (!arrival)
        throw new NotFoundException('Localisation d’arrivée introuvable');
      step.arrivalLocation = arrival;
    }

    Object.assign(step, dto);
    return this.stepRepo.save(step);
  }

  async remove(id: number, user: User): Promise<void> {
    const step = await this.findOne(id);
    if (step.receivedBy?.id !== user.id && !user.administrator) {
      throw new ForbiddenException('Non autorisé à supprimer cette étape');
    }
    await this.stepRepo.delete(id);
  }
}
