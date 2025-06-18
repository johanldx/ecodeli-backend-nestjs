import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationStatus, AdTypes } from '../conversations/entities/conversation.entity';
import { AdPayment } from '../ad-payments/entities/ad-payment.entity';
import { ShoppingAd } from '../shopping-ads/entities/shopping-ads.entity';
import { DeliveryStep } from '../delivery-steps/entities/delivery-step.entity';
import { ReleaseCartAd } from '../release-cart-ads/entities/release-cart-ad.entity';
import { PersonalServiceAd } from '../personal-services-ads/personal-service-ad.entity';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { PaymentStatus } from '../ad-payments/entities/payment.enums';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class OrderTrackingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(AdPayment)
    private paymentRepo: Repository<AdPayment>,
    @InjectRepository(ShoppingAd)
    private shoppingRepo: Repository<ShoppingAd>,
    @InjectRepository(DeliveryStep)
    private deliveryRepo: Repository<DeliveryStep>,
    @InjectRepository(ReleaseCartAd)
    private releaseRepo: Repository<ReleaseCartAd>,
    @InjectRepository(PersonalServiceAd)
    private personalServiceRepo: Repository<PersonalServiceAd>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailService: EmailService,
    private walletsService: WalletsService,
  ) {}

  async getOrderTracking(email: string, conversationId: number) {
    const conversation = await this.conversationRepo.findOne({ where: { id: conversationId }, relations: ['userFrom'] });
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    // Récupération de l'annonce
    let ad: any;
    switch (conversation.adType) {
      case AdTypes.ShoppingAds:
        ad = await this.shoppingRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      case AdTypes.DeliverySteps:
        ad = await this.deliveryRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      case AdTypes.ReleaseCartAds:
        ad = await this.releaseRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      case AdTypes.ServiceProvisions:
        ad = await this.personalServiceRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      default:
        throw new NotFoundException('Type d\'annonce inconnu');
    }
    if (!ad || !ad.postedBy || ad.postedBy.email !== email) throw new BadRequestException('Email non autorisé');

    // Paiement
    const payment = ad ? await this.paymentRepo.findOne({ where: { reference_id: ad.id, payment_type: conversation.adType as unknown as import('../ad-payments/entities/payment.enums').PaymentTypes } }) : null;

    return {
      annonce: ad ? ad : null,
      statutAnnonce: ad ? ad.status : null,
      statutConversation: conversation.status,
      statutPaiement: payment ? payment.status : null,
      titreAnnonce: ad?.title || ad?.name || '',
      typeAnnonce: conversation.adType,
    };
  }

  async validateOrder(email: string, conversationId: number) {
    const conversation = await this.conversationRepo.findOne({ where: { id: conversationId }, relations: ['userFrom'] });
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    // Récupération de l'annonce
    let ad: any;
    switch (conversation.adType) {
      case AdTypes.ShoppingAds:
        ad = await this.shoppingRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      case AdTypes.DeliverySteps:
        ad = await this.deliveryRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      case AdTypes.ReleaseCartAds:
        ad = await this.releaseRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      case AdTypes.ServiceProvisions:
        ad = await this.personalServiceRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        break;
      default:
        throw new NotFoundException('Type d\'annonce inconnu');
    }
    if (!ad || !ad.postedBy || ad.postedBy.email !== email) throw new BadRequestException('Email non autorisé');

    // Récupération et mise à jour du paiement
    const payment = ad ? await this.paymentRepo.findOne({ where: { reference_id: ad.id, payment_type: conversation.adType as unknown as import('../ad-payments/entities/payment.enums').PaymentTypes } }) : null;
    if (payment && payment.status !== PaymentStatus.COMPLETED) {
      payment.status = PaymentStatus.COMPLETED;
      await this.paymentRepo.save(payment);
      // Transfert du pending vers le disponible
      if (payment.user) {
        await this.walletsService.movePendingToAvailable(payment.user.id, payment.amount);
      }
    }

    // Statut completed
    conversation.status = ConversationStatus.Completed;
    await this.conversationRepo.save(conversation);
    if (ad && ad.status !== undefined) {
      ad.status = 'completed';
      if (conversation.adType === AdTypes.ShoppingAds) await this.shoppingRepo.save(ad);
      if (conversation.adType === AdTypes.DeliverySteps) await this.deliveryRepo.save(ad);
      if (conversation.adType === AdTypes.ReleaseCartAds) await this.releaseRepo.save(ad);
      if (conversation.adType === AdTypes.ServiceProvisions) await this.personalServiceRepo.save(ad);
    }

    // Envoi d'email de notification
    if (payment && payment.user) {
      const adName = ad?.title || ad?.name || `Annonce #${ad?.id}` || 'Votre annonce';
      await this.emailService.sendEmail(
        payment.user.email,
        'Paiement validé - EcoDeli',
        'Paiement validé avec succès',
        `Félicitations ! Votre paiement de ${payment.amount}€ pour "${adName}" (conversation #${conversation.id}) a été validé avec succès. L'argent a été transféré sur votre compte.`
      );
    }

    return { success: true };
  }
} 