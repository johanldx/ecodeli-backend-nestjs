import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trader } from './trader.entity';
import { CreateTraderDto } from './dto/create-trader.dto';
import { UpdateTraderDto } from './dto/update-trader.dto';
import { ValidationStatus } from './trader.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class TradersService {
  constructor(
    @InjectRepository(Trader)
    private repo: Repository<Trader>,
  ) {}

  async create(dto: CreateTraderDto & { user_id: number }): Promise<Trader> {
    const entity = this.repo.create({
      ...dto,
      status: ValidationStatus.PENDING,
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<Trader[]> {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Trader> {
    const trader = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!trader) throw new NotFoundException('Trader not found');
    return trader;
  }

  async update(id: number, dto: UpdateTraderDto, user: User): Promise<Trader> {
    const trader = await this.findOne(id);
    Object.assign(trader, dto);
    return this.repo.save(trader);
  }

  async updateStatus(id: number, status: ValidationStatus): Promise<Trader> {
    const trader = await this.findOne(id);
    trader.status = status;
    return this.repo.save(trader);
  }

  async remove(id: number): Promise<void> {
    const trader = await this.findOne(id);
    await this.repo.remove(trader);
  }

  async findByUserId(userId: number): Promise<Trader> {
    const trader = await this.repo.findOne({ where: { user: { id: userId } } });
    if (!trader) {
      throw new NotFoundException('Trader profile not found');
    }
    return trader;
  }
}
