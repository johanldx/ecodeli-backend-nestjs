import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscriptions.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = this.subscriptionRepo.create(createSubscriptionDto);
    return this.subscriptionRepo.save(subscription);
  }

  async findAll(query: any): Promise<Subscription[]> {
    const qb = this.subscriptionRepo.createQueryBuilder('subscription');

    // Example of filters you might apply to the query.
    if (query.name) {
      qb.andWhere('subscription.name LIKE :name', { name: `%${query.name}%` });
    }

    if (query.price_min) {
      qb.andWhere('subscription.price >= :price_min', {
        price_min: query.price_min,
      });
    }

    if (query.price_max) {
      qb.andWhere('subscription.price <= :price_max', {
        price_max: query.price_max,
      });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOneBy({ id });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);
    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepo.save(subscription);
  }

  async remove(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepo.delete(subscription.id);
  }
}
