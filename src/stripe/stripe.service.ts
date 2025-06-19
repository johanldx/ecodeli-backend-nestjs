import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Conversation, ConversationStatus } from 'src/conversations/entities/conversation.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { PaymentStatus } from 'src/subscription-payments/entities/subscription-payment.entity';
import { PaymentTypes } from 'src/ad-payments/entities/payment.enums';
import { User } from 'src/users/user.entity';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { Message } from 'src/messages/entities/message.entity';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';
import { ReleaseCartAd } from 'src/release-cart-ads/entities/release-cart-ad.entity';
import { PersonalServiceAd } from 'src/personal-services-ads/personal-service-ad.entity';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';
import { EmailService } from '../email/email.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

constructor(
  private configService: ConfigService,

  @InjectRepository(Conversation)
  private conversationRepo: Repository<Conversation>,

  @InjectRepository(AdPayment)
  private paymentRepo: Repository<AdPayment>,

  @InjectRepository(User)
  private userRepo: Repository<User>,

  @InjectRepository(Message)
  private messageRepo: Repository<Message>,

  @InjectRepository(ShoppingAd)
  private readonly shoppingRepo: Repository<ShoppingAd>,

  @InjectRepository(DeliveryStep)
  private readonly deliveryRepo: Repository<DeliveryStep>,

  @InjectRepository(ReleaseCartAd)
  private readonly releaseRepo: Repository<ReleaseCartAd>,

  @InjectRepository(PersonalServiceAd)
  private readonly personalServiceRepo: Repository<PersonalServiceAd>,

  private readonly emailService: EmailService,
  private readonly walletsService: WalletsService,

) {
  const key = this.configService.get<string>('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  this.stripe = new Stripe(key, { apiVersion: '2025-05-28.basil' });
}

  async createStripeCustomer(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (user.stripe_id) {
      return user.stripe_id;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      metadata: {
        userId: String(user.id),
      },
    });

    user.stripe_id = customer.id;
    await this.userRepo.save(user);

    return customer.id;
  }

  async createCheckoutSession(conversationId: number, userId: number, url: string) {
    const conv = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conv)
      throw new BadRequestException('Conversation introuvable');
    if (!conv.price || conv.price <= 0)
      throw new BadRequestException('Prix invalide pour cette conversation');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user)
      throw new BadRequestException('Utilisateur introuvable');

    if (!user.stripe_id) {
      this.createStripeCustomer(user.id);
    }

    let additionalPrice = 0;
    let additionalName = ''; 

    if (conv.adType === 'DeliverySteps') {
      const deliveryStep = await this.deliveryRepo.findOne({
      where: { id: conv.adId },
      relations: ['arrivalLocation'],
      });

      if (deliveryStep && deliveryStep.arrivalLocation && deliveryStep.arrivalLocation.price) {
      additionalPrice = deliveryStep.arrivalLocation.price;
      additionalName = deliveryStep.arrivalLocation.name + ' (' + deliveryStep.arrivalLocation.city + ')';
      }
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
      price_data: {
        currency: 'eur',
        product_data: {
        name: `Paiement Ecodeli - ${conv.adType}`,
        },
        unit_amount: Math.round(conv.price * 100),
      },
      quantity: 1,
      },
      {
      price_data: {
        currency: 'eur',
        product_data: {
        name: `Frais de services`,
        },
        unit_amount: Math.round(conv.price * 100 * 0.05),
      },
      quantity: 1,
      },
    ];

    if (additionalPrice !== 0 && additionalName !== '') {
      lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
        name: additionalName,
        },
        unit_amount: Math.round(additionalPrice * 100),
      },
      quantity: 1,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer: user.stripe_id ?? undefined,
      metadata: {
      conversationId: String(conv.id),
      adId: String(conv.adId),
      adType: conv.adType,
      userId: String(userId),
      },
      success_url: url + "&payment=sucess",
      cancel_url: url + "&payment=cancel",
    });

    return { url: session.url };
  }

  async handleEvent(event: any) {
    if (!event || !event.type) {
      console.error('L\'événement ne contient pas de type valide.');
      return;
    }

    if (event.type === 'checkout.session.completed') {
      console.log('Traitement de checkout.session.completed');
      await this.handlePaymentSuccess(event);
    } else if (event.type === 'checkout.session.failed') {
      await this.handlePaymentFailure(event);
    } else {
      console.log(`Événement non pris en charge : ${event.type}`);
    }
  }

  private async handlePaymentSuccess(event: any) {
    const session = event.data.object;
    console.log('[Stripe] handlePaymentSuccess - session:', session);

    const conversation = await this.conversationRepo.findOne({
      where: { id: Number(session.metadata.conversationId) },
    });
    if (!conversation) {
      console.error('[Stripe] Conversation non trouvée:', session.metadata.conversationId);
      throw new Error('Conversation non trouvée');
    }

    let userToUse;
    if (conversation.adType === 'ServiceProvisions') {
      const personalServiceAd = await this.personalServiceRepo.findOne({
        where: { id: conversation.adId },
        relations: ['postedBy'],
      });
      userToUse = personalServiceAd?.postedBy;
    } else {
      userToUse = conversation.userFrom;
    }

    // Création du paiement en pending - TOUJOURS créer un nouveau paiement pour chaque conversation
    const payment = this.paymentRepo.create({
      user: userToUse,
      amount: conversation.price,
      payment_type: conversation.adType as any,
      reference_id: conversation.adId,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepo.save(payment);

    // Ajout au pending du wallet
    if (payment.user) {
      await this.walletsService.addPendingAmount(payment.user.id, payment.amount);
    }

    // Pour les ServiceProvisions : garder la conversation en pending, ne pas toucher à l'annonce
    if (conversation.adType === 'ServiceProvisions') {
      conversation.status = ConversationStatus.Pending;
      await this.conversationRepo.save(conversation);
      console.log('[Stripe] ServiceProvisions - Conversation en pending pour validation manuelle');
    } else {
      // Pour les autres types : mettre la conversation en ongoing et l'annonce en 'in_progress'
      conversation.status = ConversationStatus.Ongoing;
      await this.conversationRepo.save(conversation);
      
      const adId = Number(session.metadata.adId);
      const adType = session.metadata.adType;
      const ad = await this.getAdById(adId, adType);
      if (ad) {
        ad.status = 'in_progress';
        await this.saveAd(ad, adType);
        console.log('[Stripe] Statut de l\'annonce mis à jour:', adId, 'status:', ad.status);
      }
    }

    const messageDto: any = {
      conversation: conversation.id,
      content: 'Le paiement a été réalisé avec succès.',
    };
    const message = this.messageRepo.create(messageDto);
    await this.messageRepo.save(message);
    console.log('[Stripe] Message de succès créé pour la conversation:', conversation.id);

    console.log('[Stripe] Entités modifiées:', {
      conversation,
      payment,
      message,
    });

    // Après la modification des entités, envoi du mail de tracking
    try {
      const adId = Number(session.metadata.adId);
      const adType = session.metadata.adType;
      const ad = await this.getAdById(adId, adType);
      
      // LOG: Affiche le contenu de ad.postedBy ou ad.deliveryAd.postedBy pour debug
      console.log('[Stripe][DEBUG] ad:', ad);
      if (ad?.postedBy) {
        console.log('[Stripe][DEBUG] ad.postedBy:', ad.postedBy);
      }
      if (ad?.deliveryAd?.postedBy) {
        console.log('[Stripe][DEBUG] ad.deliveryAd.postedBy:', ad.deliveryAd.postedBy);
      }
      
      // Récupération du destinataire selon la logique métier
      let recipientEmail = '';
      let recipientFirstName = '';
      
      if (ad) {
        switch (adType) {
          case 'ShoppingAds':
          case 'DeliverySteps':
            // Celui qui a créé l'annonce reçoit le mail
            if (ad.postedBy) {
              recipientEmail = ad.postedBy.email;
              recipientFirstName = ad.postedBy.first_name || '';
            } else if (ad.deliveryAd && ad.deliveryAd.postedBy) {
              recipientEmail = ad.deliveryAd.postedBy.email;
              recipientFirstName = ad.deliveryAd.postedBy.first_name || '';
            }
            break;
            
          case 'ReleaseCartAds':
            // Le client de l'email relié à l'annonce reçoit le mail
            if (conversation.userFrom) {
              recipientEmail = conversation.userFrom.email;
              recipientFirstName = conversation.userFrom.first_name || '';
            }
            break;
            
          case 'ServiceProvisions':
            // Le userFrom sur la conversation reçoit le mail
            if (conversation.userFrom) {
              recipientEmail = conversation.userFrom.email;
              recipientFirstName = conversation.userFrom.first_name || '';
            }
            break;
        }
      }
      
      if (recipientEmail) {
        const frontendUrl = this.configService.get<string>('FRONDEND_URL');
        const trackingUrl = `${frontendUrl}/track?email=${encodeURIComponent(recipientEmail)}&ref=${conversation.id}`;
        await this.emailService.sendEmail(
          recipientEmail,
          'Votre paiement a été validé - Suivi de commande EcoDeli',
          'Votre paiement a bien été validé !',
          `<p><a href="${trackingUrl}" style="background:#0C392C;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Suivre ma commande</a></p>
          <p>Ou bien copiez ce lien dans votre navigateur :<br><a href="${trackingUrl}">${trackingUrl}</a></p>
          <hr style='margin:24px 0;'>
          <div style='color:#0C392C;'>
            <b>Suivi de votre commande</b><br>
            Email : ${recipientEmail}<br>
            Référence : ${conversation.id}
          </div>`
        );
      }
    } catch (e) {
      console.error('[Stripe] Erreur lors de l\'envoi du mail de tracking :', e);
    }
  }

  private async handlePaymentFailure(event: any) {
    const session = event.data.object;

    const payment = await this.paymentRepo.findOne({
      where: { reference_id: session.metadata.paymentId },
    });
    if (payment) {
      await this.paymentRepo.remove(payment);
    }

    const conversation = await this.conversationRepo.findOne({
      where: { id: Number(session.metadata.conversationId) },
    });
    if (conversation) {
      const messageDto: any = {
        conversation: conversation.id,
        content: 'Le paiement a échoué. Veuillez réessayer.',
      };
      const message = this.messageRepo.create(messageDto);
      await this.messageRepo.save(message);
    }
  }

  private async getAdById(adId: number, adType: string) {
    let ad;

    switch (adType) {
      case 'ShoppingAds':
        ad = await this.shoppingRepo.findOne({
          where: { id: adId },
          relations: ['postedBy'],
        });
        break;
      case 'DeliverySteps':
        ad = await this.deliveryRepo.findOne({
          where: { id: adId },
          relations: ['deliveryAd', 'deliveryAd.postedBy'],
        });
        break;
      case 'ReleaseCartAds':
        ad = await this.releaseRepo.findOne({
          where: { id: adId },
          relations: ['postedBy'],
        });
        break;
      case 'ServiceProvisions':
        ad = await this.personalServiceRepo.findOne({
          where: { id: adId },
          relations: ['postedBy'],
        });
        break;
      default:
        throw new Error('Type d\'annonce inconnu');
    }

    return ad;
  }

  private async saveAd(ad: any, adType: string) {
    switch (adType) {
      case 'ShoppingAds':
        ad.status = 'in_progress';
        break;
      case 'DeliverySteps':
        ad.status = 'in_progress';
        break;
      case 'ReleaseCartAds':
        ad.status = 'in_progress';
        break;
      case 'ServiceProvisions':
        break;
      default:
        throw new Error('Type d\'annonce inconnu');
    }

    // Sauvegarde de l'annonce mise à jour
    switch (adType) {
      case 'ShoppingAds':
        await this.shoppingRepo.save(ad);
        break;
      case 'DeliverySteps':
        await this.deliveryRepo.save(ad);
        break;
      case 'ReleaseCartAds':
        await this.releaseRepo.save(ad);
        break;
      case 'ServiceProvisions':
        break;
      default:
        throw new Error('Type d\'annonce inconnu');
    }
}
}