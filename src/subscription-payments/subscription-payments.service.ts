import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { UpdateSubscriptionPaymentDto } from './dto/update-subscription-payment.dto';

@Injectable()
export class SubscriptionPaymentsService {
  constructor(
    @InjectRepository(SubscriptionPayment)
    private readonly subscriptionPaymentRepo: Repository<SubscriptionPayment>,
  ) {}

  async create(
    createSubscriptionPaymentDto: CreateSubscriptionPaymentDto,
  ): Promise<SubscriptionPayment> {
    const payment = this.subscriptionPaymentRepo.create(
      createSubscriptionPaymentDto,
    );
    return this.subscriptionPaymentRepo.save(payment);
  }

  async findAll(): Promise<SubscriptionPayment[]> {
    return this.subscriptionPaymentRepo.find();
  }

  async findOne(id: number): Promise<SubscriptionPayment> {
    const payment = await this.subscriptionPaymentRepo.findOne({
      where: { id },
    });
    if (!payment) throw new NotFoundException();
    return payment;
  }

  async findMine(userId: number): Promise<SubscriptionPayment[]> {
    return this.subscriptionPaymentRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['subscription'],
    });
  }

  async findForUser(userId: number): Promise<SubscriptionPayment[]> {
    return this.subscriptionPaymentRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['subscription'],
    });
  }

  async update(
    id: number,
    updateSubscriptionPaymentDto: UpdateSubscriptionPaymentDto,
  ): Promise<SubscriptionPayment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updateSubscriptionPaymentDto);
    return this.subscriptionPaymentRepo.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.subscriptionPaymentRepo.delete(payment.id);
  }
}
