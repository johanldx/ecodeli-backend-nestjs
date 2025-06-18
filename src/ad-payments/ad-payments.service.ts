import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdPayment } from './entities/ad-payment.entity';
import { CreateAdPaymentDto } from './dto/create-ad-payment.dto';
import { UpdateAdPaymentDto } from './dto/update-ad-payment.dto';
import { PaymentStatus } from './entities/payment.enums';
import { Wallet } from '../wallets/entities/wallet.entity';
import { WalletTransaction } from '../wallet-transactions/entities/wallet-transaction.entity';
import { User } from 'src/users/user.entity';
import { WalletTransactionTypes } from 'src/wallet-transactions/entities/wallet-transaction-types.enum';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class AdPaymentsService {
  constructor(
    @InjectRepository(AdPayment)
    private adPaymentRepo: Repository<AdPayment>,

    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,

    @InjectRepository(WalletTransaction)
    private transactionRepo: Repository<WalletTransaction>,

    private walletsService: WalletsService,
  ) {}

  async create(createDto: CreateAdPaymentDto, user: User) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const payment = this.adPaymentRepo.create({
      ...createDto,
      status: PaymentStatus.PENDING,
      user,
    });
    await this.adPaymentRepo.save(payment);

    const transaction = this.transactionRepo.create({
      wallet,
      type: WalletTransactionTypes.DEPOSIT,
      amount: createDto.amount,
      related_payment: payment,
      is_available: false,
    });
    await this.transactionRepo.save(transaction);

    await this.walletsService.addPendingAmount(user.id, createDto.amount);

    return payment;
  }

  async findAll(user: User) {
    return this.adPaymentRepo.find({ where: { user: { id: user.id } } });
  }

  async findOne(id: number, user: User) {
    const payment = await this.adPaymentRepo.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: number, updateDto: UpdateAdPaymentDto, user: User) {
    const payment = await this.adPaymentRepo.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const oldStatus = payment.status;

    Object.assign(payment, updateDto);
    await this.adPaymentRepo.save(payment);

    if (
      oldStatus !== PaymentStatus.COMPLETED &&
      payment.status === PaymentStatus.COMPLETED
    ) {
      await this.walletsService.movePendingToAvailable(user.id, payment.amount);
    }

    return payment;
  }

  async remove(id: number, user: User) {
    const payment = await this.adPaymentRepo.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.adPaymentRepo.remove(payment);
    return { deleted: true };
  }
}
