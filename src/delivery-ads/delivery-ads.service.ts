import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAd, AdStatus } from './entities/delivery-ads.entity';
import { CreateDeliveryAdDto } from './dto/create-delivery-ads.dto';
import { UpdateDeliveryAdDto } from './dto/update-delivery-ads.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class DeliveryAdsService {
  constructor(
    @InjectRepository(DeliveryAd)
    private readonly adRepo: Repository<DeliveryAd>,
  ) {}

  async create(dto: CreateDeliveryAdDto, user: User): Promise<DeliveryAd> {
    const ad = this.adRepo.create({
      ...dto,
      status: AdStatus.PENDING,
      postedBy: user,
    });
    return this.adRepo.save(ad);
  }

  async findAll(user: User, filters: any): Promise<DeliveryAd[]> {
    const qb = this.adRepo
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.postedBy', 'postedBy')
      .leftJoinAndSelect('ad.departure_location', 'departure')
      .leftJoinAndSelect('ad.arrival_location', 'arrival');

    // Si non admin → voir toutes les annonces PENDING ou IN_PROGRESS + les siennes
    if (!user.administrator) {
      qb.where('ad.status IN (:...allowed)', {
        allowed: [AdStatus.PENDING, AdStatus.IN_PROGRESS],
      }).orWhere('ad.postedBy.id = :userId', { userId: user.id });
    }

    // Filtres facultatifs
    if (filters.posted_by) {
      qb.andWhere('ad.postedBy.id = :posted_by', {
        posted_by: filters.posted_by,
      });
    }
    if (filters.departure_location) {
      qb.andWhere('departure.id = :dep', {
        dep: filters.departure_location,
      });
    }
    if (filters.arrival_location) {
      qb.andWhere('arrival.id = :arr', {
        arr: filters.arrival_location,
      });
    }
    if (filters.delivery_date) {
      qb.andWhere('DATE(ad.delivery_date) = DATE(:date)', {
        date: filters.delivery_date,
      });
    }

    return qb.getMany();
  }

  async findOne(id: number, user: User): Promise<DeliveryAd> {
    const ad = await this.adRepo.findOne({
      where: { id },
      relations: ['postedBy', 'departure_location', 'arrival_location'],
    });

    if (!ad) throw new NotFoundException();

    // Accès limité
    if (
      !user.administrator &&
      ad.postedBy.id !== user.id &&
      ![AdStatus.PENDING, AdStatus.IN_PROGRESS].includes(ad.status)
    ) {
      throw new ForbiddenException();
    }

    return ad;
  }

  async update(
    id: number,
    dto: UpdateDeliveryAdDto,
    user: User,
  ): Promise<DeliveryAd> {
    const ad = await this.findOne(id, user);

    // Statut non modifiable ici
    if ('status' in dto) {
      throw new ForbiddenException(
        'Le statut ne peut être modifié que via une route dédiée',
      );
    }

    // Seul le proprio ou admin peut modifier
    if (!user.administrator && ad.postedBy.id !== user.id) {
      throw new ForbiddenException();
    }

    Object.assign(ad, dto);
    return this.adRepo.save(ad);
  }

  async remove(id: number, user: User): Promise<void> {
    const ad = await this.findOne(id, user);

    if (!user.administrator && ad.postedBy.id !== user.id) {
      throw new ForbiddenException();
    }

    await this.adRepo.delete(ad.id);
  }

  async updateStatus(
    id: number,
    status: AdStatus,
    user: User,
  ): Promise<DeliveryAd> {
    const ad = await this.adRepo.findOneBy({ id });
    if (!ad) throw new NotFoundException();

    // Seul un admin peut modifier le statut
    if (!user.administrator) {
      throw new ForbiddenException();
    }

    ad.status = status;
    return this.adRepo.save(ad);
  }
}
