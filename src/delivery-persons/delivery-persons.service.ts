import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryPerson, ValidationStatus } from './delivery-person.entity';
import { CreateDeliveryPersonDto } from './dto/create-delivery-person.dto';
import { UpdateDeliveryPersonDto } from './dto/update-delivery-person.dto';
import { User } from 'src/users/user.entity';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';

@Injectable()
export class DeliveryPersonsService {
  constructor(
    @InjectRepository(DeliveryPerson)
    private repo: Repository<DeliveryPerson>,
  ) {}

  async create(
    dto: CreateDeliveryPersonDto & { user_id: number },
  ): Promise<DeliveryPerson> {
    const entity = this.repo.create({
      ...dto,
      status: ValidationStatus.PENDING,
    });
    return this.repo.save(entity);
  }

  findAll(): Promise<DeliveryPerson[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<DeliveryPerson> {
    const dp = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!dp) throw new NotFoundException('Delivery person not found');
    return dp;
  }

  async update(
    id: number,
    dto: UpdateDeliveryPersonDto,
    user: User,
  ): Promise<DeliveryPerson> {
    const entity = await this.findOne(id);

    assertUserOwnsResourceOrIsAdmin(user, entity.user_id);

    const forceReset =
      dto.bank_account ||
      dto.identity_card_document ||
      dto.driver_license_document;
    if (forceReset) {
      entity.status = ValidationStatus.PENDING;
    }

    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const dp = await this.findOne(id);
    await this.repo.remove(dp);
  }

  async updateStatus(
    id: number,
    status: ValidationStatus,
  ): Promise<DeliveryPerson> {
    const entity = await this.findOne(id);
    entity.status = status;
    return this.repo.save(entity);
  }
}
