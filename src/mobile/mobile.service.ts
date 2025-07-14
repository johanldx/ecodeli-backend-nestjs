import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryPerson } from 'src/delivery-persons/delivery-person.entity';
import {
  DeliveryStep,
  DeliveryStepStatus,
} from 'src/delivery-steps/entities/delivery-step.entity';
import {
  AdStatus,
  ShoppingAd,
} from 'src/shopping-ads/entities/shopping-ads.entity';
import { User } from 'src/users/user.entity';
import { AdTypes } from 'src/conversations/entities/conversation.entity';
import { PaymentStatus, PaymentTypes } from 'src/ad-payments/entities/payment.enums';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { WalletsService } from 'src/wallets/wallets.service';
import { EmailService } from 'src/email/email.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class MobileService {
  constructor(
    @InjectRepository(DeliveryPerson)
    private deliveryPersonRepo: Repository<DeliveryPerson>,

    @InjectRepository(DeliveryStep)
    private deliveryStepRepo: Repository<DeliveryStep>,

    @InjectRepository(ShoppingAd)
    private shoppingAdRepo: Repository<ShoppingAd>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(AdPayment)
    private paymentRepo: Repository<AdPayment>,

    private walletsService: WalletsService,
    private emailService: EmailService,
  ) {}

  async findDeliveryPersonById(id: number): Promise<DeliveryPerson | null> {
    return this.deliveryPersonRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findDeliveryAdsForUser(userId: number) {
    const validStatuses = ['in_progress', 'completed'];

    const shoppingAds = await this.shoppingAdRepo.find({
      where: {
        postedBy: { id: userId },
        status: In(validStatuses),
      },
    });

    const deliverySteps = await this.deliveryStepRepo
      .createQueryBuilder('step')
      .leftJoinAndSelect('step.deliveryAd', 'ad')
      .leftJoin('ad.postedBy', 'postedBy')
      .where('step.status IN (:...statuses)', { statuses: validStatuses })
      .andWhere('postedBy.id = :userId', { userId })
      .getMany();

    const formatDate = (date: Date) =>
      date.toLocaleString('fr-FR', { hour12: false });

    return [
      ...shoppingAds.map((ad) => ({
        id: ad.id,
        type: 'shopping',
        title: ad.title,
        createdAt: formatDate(ad.createdAt),
        status: ad.status,
      })),
      ...deliverySteps.map((step) => ({
        id: step.id,
        type: 'delivery',
        title: step.deliveryAd.title,
        createdAt: formatDate(step.createdAt),
        status: step.status,
      })),
    ];
  }

  async completeAd(
    type: 'shopping' | 'delivery',
    id: number,
  ): Promise<{ success: boolean; message?: string }> {
    let ad: any;
    let adType: AdTypes;

    if (type === 'shopping') {
      ad = await this.shoppingAdRepo.findOne({ 
        where: { id }, 
        relations: ['postedBy'] 
      });
      if (!ad) {
        throw new NotFoundException('Annonce shopping introuvable');
      }
      if (!ad.postedBy) {
        const user = await this.userRepo.findOne({
          where: { id: ad.posted_by }
        });
        ad.postedBy = user;
      }
      adType = AdTypes.ShoppingAds;
    } else if (type === 'delivery') {
      ad = await this.deliveryStepRepo.findOne({
        where: { id },
        relations: ['deliveryAd', 'deliveryAd.postedBy'],
      });
      if (!ad) {
        throw new NotFoundException('Étape de livraison introuvable');
      }
      adType = AdTypes.DeliverySteps;
    } else {
      throw new BadRequestException('Type d\'annonce non supporté');
    }

    const payment = await this.paymentRepo.findOne({ 
      where: { 
        reference_id: ad.id, 
        payment_type: adType as unknown as PaymentTypes 
      } 
    });

    if (payment && payment.status !== PaymentStatus.COMPLETED) {
      payment.status = PaymentStatus.COMPLETED;
      await this.paymentRepo.save(payment);
      
      if (payment.user) {
        await this.walletsService.movePendingToAvailable(payment.user.id, payment.amount);
      }
    }

    if (type === 'shopping') {
      ad.status = AdStatus.COMPLETED;
      await this.shoppingAdRepo.save(ad);
    } else if (type === 'delivery') {
      ad.status = DeliveryStepStatus.COMPLETED;
      await this.deliveryStepRepo.save(ad);
    }

    if (payment) {
      const adName = ad?.title || ad?.name || `Annonce #${ad?.id}` || 'Votre annonce';
      let recipientEmail = '';
      let recipientName = '';
      
      if (type === 'shopping') {
        if (ad?.postedBy) {
          recipientEmail = ad.postedBy.email;
          recipientName = `${ad.postedBy.first_name} ${ad.postedBy.last_name}`;
        }
      } else if (type === 'delivery') {
        if (ad?.deliveryAd?.postedBy) {
          recipientEmail = ad.deliveryAd.postedBy.email;
          recipientName = `${ad.deliveryAd.postedBy.first_name} ${ad.deliveryAd.postedBy.last_name}`;
        }
      }
      
      if (recipientEmail) {
        await this.emailService.sendEmail(
          recipientEmail,
          'Paiement validé - EcoDeli',
          'Paiement validé avec succès',
          `Félicitations ${recipientName} ! Votre paiement de ${payment.amount}€ pour "${adName}" a été validé avec succès. L'argent a été débité de votre compte.`
        );
      }
    }

    return { success: true };
  }
}
