import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { User } from 'src/users/user.entity';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,
  ) {}

  create(dto: CreateClientDto, user: User): Promise<Client> {
    assertUserOwnsResourceOrIsAdmin(user, dto.user_id);
    const client = this.clientRepo.create(dto);
    return this.clientRepo.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepo.remove(client);
  }

  async markOnboardingAsSeen(id: number, user: User): Promise<Client> {
    const client = await this.findOne(id);
    if (!client) throw new NotFoundException('Client not found');
    assertUserOwnsResourceOrIsAdmin(user, client.user_id);
    client.onboarding = true;
    return this.clientRepo.save(client);
  }

  async findByUserId(userId: number): Promise<Client> {
    const client = await this.clientRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }
}
