import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  async findAll(): Promise<Wallet[]> {
    return this.walletRepo.find({ order: { created_at: 'DESC' } });
  }

  async getMyWallet(user: User): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }
}
