import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryPerson } from 'src/delivery-persons/delivery-person.entity';
import {
  DeliveryStep,
  DeliveryStepStatus,
} from 'src/delivery-steps/entities/delivery-step.entity';
import {
  AdStatus,
  ShoppingAd,
} from 'src/shopping-ads/entities/shopping-ads.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class MobileService {
  constructor(
    @InjectRepository(DeliveryPerson)
    private deliveryPersonRepo: Repository<DeliveryPerson>,

    @InjectRepository(DeliveryStep)
    private deliveryStepRepo: Repository<DeliveryStep>,

    @InjectRepository(ShoppingAd)
    private shoppingAdRepo: Repository<ShoppingAd>,
  ) {}

  async findDeliveryPersonById(id: number): Promise<DeliveryPerson | null> {
    return this.deliveryPersonRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findDeliveryAdsForUser(userId: number) {
    const validStatuses = ['in_progress', 'completed'];

    const shoppingAds = await this.shoppingAdRepo.find({
      where: {
        postedBy: { id: userId },
        status: In(validStatuses),
      },
    });

    const deliverySteps = await this.deliveryStepRepo
      .createQueryBuilder('step')
      .leftJoinAndSelect('step.deliveryAd', 'ad')
      .leftJoin('ad.postedBy', 'postedBy')
      .where('step.status IN (:...statuses)', { statuses: validStatuses })
      .andWhere('postedBy.id = :userId', { userId })
      .getMany();

    const formatDate = (date: Date) =>
      date.toLocaleString('fr-FR', { hour12: false });

    return [
      ...shoppingAds.map((ad) => ({
        id: ad.id,
        type: 'shopping',
        title: ad.title,
        createdAt: formatDate(ad.createdAt),
        status: ad.status,
      })),
      ...deliverySteps.map((step) => ({
        id: step.id,
        type: 'delivery',
        title: step.deliveryAd.title,
        createdAt: formatDate(step.createdAt),
        status: step.status,
      })),
    ];
  }

  async completeAd(
    type: 'shopping' | 'delivery',
    id: number,
  ): Promise<boolean> {
    if (type === 'shopping') {
      const ad = await this.shoppingAdRepo.findOne({ where: { id } });
      if (!ad) return false;
      ad.status = AdStatus.COMPLETED;
      await this.shoppingAdRepo.save(ad);
      return true;
    }

    if (type === 'delivery') {
      const step = await this.deliveryStepRepo.findOne({
        where: { id },
        relations: ['deliveryAd'],
      });
      if (!step) return false;
      step.status = DeliveryStepStatus.COMPLETED;
      await this.deliveryStepRepo.save(step);
      return true;
    }

    return false;
  }
}
