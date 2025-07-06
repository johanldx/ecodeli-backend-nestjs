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
import { RatingsService } from '../ratings/ratings.service';

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
    private ratingsService: RatingsService,
  ) {}

  async getOrderTracking(email: string, conversationId: number) {
    const conversation = await this.conversationRepo.findOne({ where: { id: conversationId }, relations: ['userFrom'] });
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    // Récupération de l'annonce
    let ad: any;
    switch (conversation.adType) {
      case AdTypes.ShoppingAds:
        ad = await this.shoppingRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        // Pour ShoppingAds, postedBy pointe vers user_id, on doit récupérer l'utilisateur via posted_by
        if (ad && !ad.postedBy) {
          const user = await this.userRepo.findOne({
            where: { id: ad.posted_by }
          });
          ad.postedBy = user;
        }
        break;
      case AdTypes.DeliverySteps:
        ad = await this.deliveryRepo.findOne({ 
          where: { id: conversation.adId }, 
          relations: ['deliveryAd', 'deliveryAd.postedBy'] 
        });
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
    if (!ad) throw new BadRequestException('Email non autorisé');
    
    // Vérification de l'autorisation selon le type d'annonce
    let authorizedUser: User | null = null;
    switch (conversation.adType) {
      case AdTypes.ServiceProvisions:
        // Pour ServiceProvisions : le userFrom (client qui a réservé)
        authorizedUser = conversation.userFrom;
        break;
      case AdTypes.ShoppingAds:
      case AdTypes.ReleaseCartAds:
        // Pour les autres types : celui qui a créé l'annonce
        authorizedUser = ad.postedBy;
        break;
      case AdTypes.DeliverySteps:
        // Pour DeliverySteps : celui qui a créé l'annonce (via deliveryAd)
        authorizedUser = ad.deliveryAd?.postedBy || null;
        break;
    }
    
    if (!authorizedUser || authorizedUser.email !== email) {
      throw new BadRequestException('Email non autorisé');
    }

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
    const conversation = await this.conversationRepo.findOne({ 
      where: { id: conversationId }, 
      relations: ['userFrom'] 
    });
    if (!conversation) throw new NotFoundException('Conversation introuvable');
    
    // Récupération de l'annonce
    let ad: any;
    switch (conversation.adType) {
      case AdTypes.ShoppingAds:
        ad = await this.shoppingRepo.findOne({ where: { id: conversation.adId }, relations: ['postedBy'] });
        // Pour ShoppingAds, postedBy pointe vers user_id, on doit récupérer l'utilisateur via posted_by
        if (ad && !ad.postedBy) {
          const user = await this.userRepo.findOne({
            where: { id: ad.posted_by }
          });
          ad.postedBy = user;
        }
        break;
      case AdTypes.DeliverySteps:
        ad = await this.deliveryRepo.findOne({ 
          where: { id: conversation.adId }, 
          relations: ['deliveryAd', 'deliveryAd.postedBy'] 
        });
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
    if (!ad) throw new BadRequestException('Email non autorisé');
    
    // Vérification de l'autorisation selon le type d'annonce
    let authorizedUser: User | null = null;
    switch (conversation.adType) {
      case AdTypes.ServiceProvisions:
        // Pour ServiceProvisions : le userFrom (client qui a réservé)
        authorizedUser = conversation.userFrom;
        break;
      case AdTypes.ShoppingAds:
      case AdTypes.ReleaseCartAds:
        // Pour les autres types : celui qui a créé l'annonce
        authorizedUser = ad.postedBy;
        break;
      case AdTypes.DeliverySteps:
        // Pour DeliverySteps : celui qui a créé l'annonce (via deliveryAd)
        authorizedUser = ad.deliveryAd?.postedBy || null;
        break;
    }
    
    if (!authorizedUser || authorizedUser.email !== email) {
      throw new BadRequestException('Email non autorisé');
    }

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

    // Statut completed pour la conversation
    conversation.status = ConversationStatus.Completed;
    await this.conversationRepo.save(conversation);
    
    // Mise à jour du statut de l'annonce (sauf pour ServiceProvisions)
    if (ad && ad.status !== undefined && conversation.adType !== AdTypes.ServiceProvisions) {
      ad.status = 'completed';
      if (conversation.adType === AdTypes.ShoppingAds) await this.shoppingRepo.save(ad);
      if (conversation.adType === AdTypes.DeliverySteps) await this.deliveryRepo.save(ad);
      if (conversation.adType === AdTypes.ReleaseCartAds) await this.releaseRepo.save(ad);
    }
    // Pour ServiceProvisions : on ne touche pas au statut de l'annonce

    // Envoi d'email de notification
    if (payment) {
      const adName = ad?.title || ad?.name || `Annonce #${ad?.id}` || 'Votre annonce';
      
      // Déterminer le destinataire selon le type d'annonce
      let recipientEmail = '';
      let recipientName = '';
      
      switch (conversation.adType) {
        case AdTypes.ServiceProvisions:
          // Pour ServiceProvisions : le userFrom (client qui a réservé)
          if (conversation.userFrom) {
            recipientEmail = conversation.userFrom.email;
            recipientName = `${conversation.userFrom.first_name} ${conversation.userFrom.last_name}`;
          }
          break;
        case AdTypes.ShoppingAds:
        case AdTypes.ReleaseCartAds:
          // Pour les autres types : celui qui a créé l'annonce
          if (ad?.postedBy) {
            recipientEmail = ad.postedBy.email;
            recipientName = `${ad.postedBy.first_name} ${ad.postedBy.last_name}`;
          }
          break;
        case AdTypes.DeliverySteps:
          // Pour DeliverySteps : celui qui a créé l'annonce (via deliveryAd)
          if (ad?.deliveryAd?.postedBy) {
            recipientEmail = ad.deliveryAd.postedBy.email;
            recipientName = `${ad.deliveryAd.postedBy.first_name} ${ad.deliveryAd.postedBy.last_name}`;
          }
          break;
      }
      
      if (recipientEmail) {
        await this.emailService.sendEmail(
          recipientEmail,
          'Paiement validé - EcoDeli',
          'Paiement validé avec succès',
          `Félicitations ${recipientName} ! Votre paiement de ${payment.amount}€ pour "${adName}" (conversation #${conversation.id}) a été validé avec succès. L'argent a été débité de votre compte.`
        );
      }
    }

    // Pour les ServiceProvisions, créer une entrée de rating et envoyer l'email de rating
    if (conversation.adType === AdTypes.ServiceProvisions && conversation.userFrom && ad?.postedBy) {
      console.log('[Rating] Création de l\'entrée de rating pour conversation:', conversation.id);
      
      try {
        const ratingEntry = await this.ratingsService.createRatingEntry(
          ad.postedBy.id, // providerId
          conversation.userFrom.id, // raterId (le client)
          conversation.id, // conversationId
        );

        console.log('[Rating] Entrée de rating créée avec token:', ratingEntry.token);

        // Envoyer l'email de rating au client
        await this.emailService.sendRatingEmail(
          conversation.userFrom.email,
          ad.postedBy.first_name + ' ' + ad.postedBy.last_name,
          ad.title,
          ratingEntry.token
        );
        
        console.log('[Rating] Email de rating envoyé avec succès à:', conversation.userFrom.email);
      } catch (error) {
        console.error('[Rating] Erreur lors de la création du rating:', error);
      }
    }

    return { success: true };
  }
} 