import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trader } from './trader.entity';
import { CreateTraderDto } from './dto/create-trader.dto';
import { UpdateTraderDto } from './dto/update-trader.dto';
import { ValidationStatus } from './trader.entity';
import { User } from 'src/users/user.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { PaymentStatus } from 'src/ad-payments/entities/payment.enums';

@Injectable()
export class TradersService {
  constructor(
    @InjectRepository(Trader)
    private repo: Repository<Trader>,
    @InjectRepository(AdPayment)
    private adPaymentRepo: Repository<AdPayment>,
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

  async updateStatus(id: number, status: ValidationStatus, reduction_percent?: number): Promise<Trader> {
    const trader = await this.findOne(id);
    trader.status = status;
    if (reduction_percent !== undefined) {
      trader.reduction_percent = reduction_percent;
    }
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

  async getMonthlyStats(traderId: number): Promise<{
    totalPaid: number;
    totalEarned: number;
    reductionAmount: number;
  }> {
    const trader = await this.findOne(traderId);
    
    // Calculer le début et la fin du mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Récupérer tous les paiements du trader pour le mois en cours
    const payments = await this.adPaymentRepo.find({
      where: {
        user: { id: trader.user.id },
        status: PaymentStatus.COMPLETED,
        created_at: Between(startOfMonth, endOfMonth)
      }
    });

    // Montant total payé (avec réduction appliquée)
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculer le montant sans réduction
    const reductionPercent = trader.reduction_percent || 0;
    const totalWithoutReduction = reductionPercent > 0 ? (totalPaid * 100) / (100 - reductionPercent) : totalPaid;
    
    // Montant économisé grâce à la réduction
    const reductionAmount = totalWithoutReduction - totalPaid;

    return {
      totalPaid: totalWithoutReduction, // Prix barré (sans réduction)
      totalEarned: totalPaid, // Prix réel payé (avec réduction)
      reductionAmount
    };
  }
}
