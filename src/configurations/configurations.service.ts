import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './configuration.entity';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ConfigurationResponseDto } from './dto/configuration-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ConfigurationsService {
  constructor(
    @InjectRepository(Configuration)
    private configRepo: Repository<Configuration>,
  ) {}

  async create(dto: CreateConfigurationDto): Promise<ConfigurationResponseDto> {
    const config = this.configRepo.create(dto);
    const saved = await this.configRepo.save(config);
    return plainToInstance(ConfigurationResponseDto, saved);
  }

  async findAll(): Promise<ConfigurationResponseDto[]> {
    const list = await this.configRepo.find();
    return plainToInstance(ConfigurationResponseDto, list);
  }

  async findByKey(key: string): Promise<ConfigurationResponseDto> {
    const config = await this.configRepo.findOneBy({ key });
    if (!config) throw new NotFoundException('Configuration not found');
    return plainToInstance(ConfigurationResponseDto, config);
  }

  async update(id: number, dto: UpdateConfigurationDto): Promise<ConfigurationResponseDto> {
    const config = await this.configRepo.findOneBy({ id });
    if (!config) throw new NotFoundException('Configuration not found');
    Object.assign(config, dto);
    const saved = await this.configRepo.save(config);
    return plainToInstance(ConfigurationResponseDto, saved);
  }

  async remove(id: number): Promise<ConfigurationResponseDto> {
    const config = await this.configRepo.findOneBy({ id });
    if (!config) throw new NotFoundException('Configuration not found');
    const removed = await this.configRepo.remove(config);
    return plainToInstance(ConfigurationResponseDto, removed);
  }
}
