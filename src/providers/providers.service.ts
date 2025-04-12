import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider, ValidationStatus } from './provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { User } from 'src/users/user.entity';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private repo: Repository<Provider>
  ) {}

  async create(dto: CreateProviderDto): Promise<Provider> {
    const provider = this.repo.create({
        ...dto,
        user: { id: dto.user_id },
        status: ValidationStatus.PENDING
        });    return this.repo.save(provider);
  }

  findAll(): Promise<Provider[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Provider> {
    const provider = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async update(id: number, dto: UpdateProviderDto, user: User): Promise<Provider> {
    const provider = await this.findOne(id);
    assertUserOwnsResourceOrIsAdmin(user, provider.user.id);

    Object.assign(provider, dto);
    provider.status = ValidationStatus.PENDING;
    return this.repo.save(provider);
  }

  async remove(id: number): Promise<void> {
    const provider = await this.findOne(id);
    await this.repo.remove(provider);
  }

  async updateStatus(id: number, status: ValidationStatus): Promise<Provider> {
    const provider = await this.findOne(id);
    provider.status = status;
    return this.repo.save(provider);
  }

  async findByUserId(userId: number): Promise<Provider> {
    const provider = await this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!provider) throw new NotFoundException('Provider profile not found');
    return provider;
  }
  
}
