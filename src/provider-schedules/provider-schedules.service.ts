import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProviderSchedule } from './provider-schedule.entity';
import { CreateProviderScheduleDto } from './dto/create-provider-schedule.dto';
import { UpdateProviderScheduleDto } from './dto/update-provider-schedule.dto';
import { ProviderScheduleDto } from './dto/provider-schedule.dto';
import { Provider } from 'src/providers/provider.entity';

@Injectable()
export class ProviderSchedulesService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,
    @InjectRepository(ProviderSchedule)
    private readonly repo: Repository<ProviderSchedule>,
  ) {}

  private toDto(entity: ProviderSchedule): ProviderScheduleDto {
    return {
      id: entity.id,
      providerId: entity.provider.id,
      personalServiceTypeId: entity.personalServiceType.id,
      startTime: entity.startTime,
      endTime: entity.endTime,
      status: entity.status,
      createdAt: entity.createdAt,
      editedAt: entity.editedAt,
    };
  }

  async create(dto: CreateProviderScheduleDto): Promise<ProviderScheduleDto> {
    const entity = this.repo.create({
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status,
      provider: { id: dto.providerId } as any,
      personalServiceType: { id: dto.personalServiceTypeId } as any,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findAll(): Promise<ProviderScheduleDto[]> {
    const list = await this.repo.find({
      relations: ['provider', 'personalServiceType'],
    });
    return list.map((e) => this.toDto(e));
  }

  async findOne(id: number): Promise<ProviderScheduleDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['provider', 'personalServiceType'],
    });
    if (!entity) throw new NotFoundException(`Schedule ${id} not found`);
    return this.toDto(entity);
  }

  async update(
    id: number,
    dto: UpdateProviderScheduleDto,
  ): Promise<ProviderScheduleDto> {
    const pre = await this.repo.preload({ id, ...dto });
    if (!pre) throw new NotFoundException(`Schedule ${id} not found`);
    const updated = await this.repo.save(pre);
    return this.toDto(updated);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0)
      throw new NotFoundException(`Schedule ${id} not found`);
  }

  async findFiltered(filters: {
    start?: Date;
    end?: Date;
    providerId?: number;
    personalServiceTypeId?: number;
  }): Promise<ProviderScheduleDto[]> {
    const where: any = {};

    if (filters.providerId) {
      const provider = await this.providerRepo.findOne({
        where: { user: { id: filters.providerId } },
      });

      if (!provider) return [];

      where.provider = { id: provider.id };
    }

    if (filters.start && filters.end) {
      where.startTime = Between(filters.start, filters.end);
    }

    if (filters.personalServiceTypeId) {
      where.personalServiceType = { id: filters.personalServiceTypeId };
    }

    const list = await this.repo.find({
      where,
      relations: ['provider', 'personalServiceType'],
    });

    return list.map((e) => this.toDto(e));
  }
}
