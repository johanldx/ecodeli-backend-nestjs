import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalServiceType } from './personal-service-type.entity';
import { CreatePersonalServiceTypeDto } from './dto/create-personal-service-type.dto';
import { UpdatePersonalServiceTypeDto } from './dto/update-personal-service-type.dto';

@Injectable()
export class PersonalServiceTypesService {
  constructor(
    @InjectRepository(PersonalServiceType)
    private readonly repository: Repository<PersonalServiceType>,
  ) {}

  async create(
    dto: CreatePersonalServiceTypeDto,
  ): Promise<PersonalServiceType> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(): Promise<PersonalServiceType[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<PersonalServiceType> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `PersonalServiceType with id ${id} not found`,
      );
    }
    return entity;
  }

  async update(
    id: number,
    dto: UpdatePersonalServiceTypeDto,
  ): Promise<PersonalServiceType> {
    const entity = await this.repository.preload({ id, ...dto });
    if (!entity) {
      throw new NotFoundException(
        `PersonalServiceType with id ${id} not found`,
      );
    }
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `PersonalServiceType with id ${id} not found`,
      );
    }
  }
}
