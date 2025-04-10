import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryStep, DeliveryStepStatus } from './entities/delivery-step.entity';
import { CreateDeliveryStepDto } from './dto/create-delivery-step.dto';
import { UpdateDeliveryStepDto } from './dto/update-delivery-step.dto';
import { User } from 'src/users/user.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';

@Injectable()
export class DeliveryStepsService {
  constructor(
    @InjectRepository(DeliveryStep)
    private readonly stepRepo: Repository<DeliveryStep>,
    @InjectRepository(DeliveryAd)
    private readonly deliveryAdRepo: Repository<DeliveryAd>,
  ) {}

  async create(dto: CreateDeliveryStepDto, user: User): Promise<DeliveryStep> {
    const deliveryAd = await this.deliveryAdRepo.findOne({ where: { id: dto.deliveryAdId } });
    if (!deliveryAd) throw new NotFoundException('Delivery Ad not found');
    
    const step = this.stepRepo.create({
      ...dto,
      status: DeliveryStepStatus.PENDING, // Default status
      receivedBy: user,
      deliveryAd,
    });
    
    return this.stepRepo.save(step);
  }

  async findAll(query: any): Promise<DeliveryStep[]> {
    const qb = this.stepRepo.createQueryBuilder('step')
      .leftJoinAndSelect('step.receivedBy', 'receivedBy')
      .leftJoinAndSelect('step.deliveryAd', 'deliveryAd');
    
    if (query.status) {
      qb.andWhere('step.status = :status', { status: query.status });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<DeliveryStep> {
    const step = await this.stepRepo.findOne({
      where: { id },
      relations: ['receivedBy', 'deliveryAd'],
    });
    if (!step) throw new NotFoundException();
    return step;
  }

  async update(id: number, dto: UpdateDeliveryStepDto): Promise<DeliveryStep> {
    const step = await this.findOne(id);
    
    if (dto.status) {
      throw new ForbiddenException('You cannot update the status directly');
    }

    Object.assign(step, dto);
    return this.stepRepo.save(step);
  }

  async remove(id: number, user: User): Promise<void> {
    const step = await this.findOne(id);
    if (step.receivedBy.id !== user.id) {
      throw new ForbiddenException();
    }
    await this.stepRepo.delete(id);
  }
}
