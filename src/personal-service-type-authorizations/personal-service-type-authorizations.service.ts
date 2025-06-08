import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalServiceTypeAuthorization } from './personal-service-type-authorization.entity';
import { CreatePersonalServiceTypeAuthorizationDto } from './dto/create-personal-service-type-authorization.dto';
import { UpdatePersonalServiceTypeAuthorizationDto } from './dto/update-personal-service-type-authorization.dto';

@Injectable()
export class PersonalServiceTypeAuthorizationsService {
  constructor(
    @InjectRepository(PersonalServiceTypeAuthorization)
    private readonly repo: Repository<PersonalServiceTypeAuthorization>,
  ) {}

  async create(
    dto: CreatePersonalServiceTypeAuthorizationDto,
  ): Promise<PersonalServiceTypeAuthorization> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(
    providerId?: number,
  ): Promise<PersonalServiceTypeAuthorization[]> {
    const entities = providerId
      ? await this.repo.find({ where: { providerId } })
      : await this.repo.find();
    return entities;
  }

  async findOne(
    providerId: number,
    personalServiceTypeId: number,
  ): Promise<PersonalServiceTypeAuthorization> {
    const entity = await this.repo.findOne({
      where: { providerId, personalServiceTypeId },
    });
    if (!entity) {
      throw new NotFoundException(
        `Authorization not found for provider=${providerId} and serviceType=${personalServiceTypeId}`,
      );
    }
    return entity;
  }

  async findOneByUserId(
    userId: number,
    personalServiceTypeId: number,
  ): Promise<PersonalServiceTypeAuthorization> {
    const entity = await this.repo
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.provider', 'provider')
      .leftJoin('provider.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('auth.personalServiceType.id = :serviceTypeId', { serviceTypeId: personalServiceTypeId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        `Authorization not found for user=${userId} and serviceType=${personalServiceTypeId}`,
      );
    }

    return entity;
  }


  async update(
    providerId: number,
    personalServiceTypeId: number,
    dto: UpdatePersonalServiceTypeAuthorizationDto,
  ): Promise<PersonalServiceTypeAuthorization> {
    const entity = await this.repo.preload({
      providerId,
      personalServiceTypeId,
      ...dto,
    });
    if (!entity) {
      throw new NotFoundException(
        `Authorization not found for provider=${providerId} and serviceType=${personalServiceTypeId}`,
      );
    }
    return this.repo.save(entity);
  }

  async remove(
    providerId: number,
    personalServiceTypeId: number,
  ): Promise<void> {
    const res = await this.repo.delete({ providerId, personalServiceTypeId });
    if (res.affected === 0) {
      throw new NotFoundException(
        `Authorization not found for provider=${providerId} and serviceType=${personalServiceTypeId}`,
      );
    }
  }
}
