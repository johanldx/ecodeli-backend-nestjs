import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Repository } from 'typeorm';
import { Wallet } from '../wallets/entities/wallet.entity';
import { User } from 'src/users/user.entity';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { WalletTransactionTypes } from './entities/wallet-transaction-types.enum';

@Injectable()
export class WalletTransactionsService {
  constructor(
    @InjectRepository(WalletTransaction)
    private transactionRepo: Repository<WalletTransaction>,

    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
  ) {}

  async create(dto: CreateWalletTransactionDto, user: User) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const isDeposit = dto.type === WalletTransactionTypes.DEPOSIT;
    const isAvailable = dto.is_available === true;

    // Vérif solde pour un retrait immédiat
    if (!isDeposit && isAvailable && wallet.amout_available < dto.amount) {
      throw new BadRequestException('Insufficient available balance');
    }

    // Vérif solde pour retrait pending
    if (!isDeposit && !isAvailable && wallet.amout_pending < dto.amount) {
      throw new BadRequestException('Insufficient pending balance');
    }

    const transaction = this.transactionRepo.create({
      ...dto,
      wallet,
    });
    await this.transactionRepo.save(transaction);

    // MAJ des montants
    if (isDeposit) {
      if (isAvailable) wallet.amout_available += dto.amount;
      else wallet.amout_pending += dto.amount;
    } else {
      if (isAvailable) wallet.amout_available -= dto.amount;
      else wallet.amout_pending -= dto.amount;
    }

    await this.walletRepo.save(wallet);
    return transaction;
  }

  async findAllAdmin() {
    return this.transactionRepo.find({ order: { created_at: 'DESC' } });
  }

  async findAllByUser(user: User) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    return this.transactionRepo.find({
      where: { wallet: { id: wallet.id } },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, user: User) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['wallet'],
    });
    if (!transaction) throw new NotFoundException('Transaction not found');

    if (transaction.wallet.user.id !== user.id) {
      throw new BadRequestException(
        'Not authorized to access this transaction',
      );
    }

    return transaction;
  }
}
