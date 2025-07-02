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
import { SubscriptionPayment } from '../subscription-payments/entities/subscription-payment.entity';
import { Subscription } from '../subscriptions/entities/subscriptions.entity';
import { Trader } from 'src/traders/trader.entity';
import { ProviderSchedule, ProviderScheduleStatus } from 'src/provider-schedules/provider-schedule.entity';

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

  @InjectRepository(Trader)
  private readonly traderRepo: Repository<Trader>,

  @InjectRepository(SubscriptionPayment)
  private readonly subscriptionPaymentRepo: Repository<SubscriptionPayment>,

  @InjectRepository(Subscription)
  private readonly subscriptionRepo: Repository<Subscription>,

  @InjectRepository(ProviderSchedule)
  private readonly providerScheduleRepo: Repository<ProviderSchedule>,

  private readonly emailService: EmailService,
  private readonly walletsService: WalletsService,

) {
  const key = this.configService.get<string>('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  this.stripe = new Stripe(key, { apiVersion: '2025-05-28.basil' });
}

  // Méthodes pour les abonnements
  async createProduct(data: { name: string; description: string }): Promise<Stripe.Product> {
    return this.stripe.products.create({
      name: data.name,
      description: data.description,
    });
  }

  async listProducts(): Promise<Stripe.Product[]> {
    const products = await this.stripe.products.list({ limit: 100 });
    return products.data;
  }

  async listPrices(): Promise<Stripe.Price[]> {
    const prices = await this.stripe.prices.list({ limit: 100 });
    return prices.data;
  }

  async updateProduct(productId: string, data: { name?: string; description?: string }): Promise<Stripe.Product> {
    return this.stripe.products.update(productId, data);
  }

  async createPrice(data: {
    product: string;
    unit_amount: number;
    currency: string;
    recurring?: { interval: 'day' | 'week' | 'month' | 'year' };
  }): Promise<Stripe.Price> {
    return this.stripe.prices.create(data);
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      configuration: undefined,
    });
  }

  async createSubscriptionCheckoutSession(
    userId: number,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (!user.stripe_id) {
      user.stripe_id = await this.createStripeCustomer(user.id);
      await this.userRepo.save(user);
    }

    // Si l'utilisateur a déjà un abonnement actif, rediriger vers le portail
    if (user.subscription_stripe_id) {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripe_id || '',
        return_url: successUrl,
        configuration: undefined,
      });
      return { url: session.url || '' };
    }

    // Sinon, créer une nouvelle session de checkout
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: user.stripe_id || undefined,
      metadata: {
        userId: String(userId),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url || '' };
  }

  async createSubscriptionChangeSession(
    userId: number,
    priceId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (!user.subscription_stripe_id) {
      throw new BadRequestException('Aucun abonnement actif à modifier');
    }

    // Créer une session de modification d'abonnement
    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripe_id || '',
      return_url: returnUrl,
      configuration: undefined,
    });

    return { url: session.url || '' };
  }

  async changeSubscription(
    userId: number,
    newPriceId: string,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (!user.subscription_stripe_id) {
      throw new BadRequestException('Aucun abonnement actif à modifier');
    }

    // Récupérer l'abonnement Stripe actuel
    const subscription = await this.stripe.subscriptions.retrieve(user.subscription_stripe_id);
    
    // Créer un nouvel item pour le nouveau prix
    const newItem = {
      id: subscription.items.data[0].id,
      price: newPriceId,
    };

    // Mettre à jour l'abonnement avec le nouveau prix
    await this.stripe.subscriptions.update(user.subscription_stripe_id, {
      items: [newItem],
      proration_behavior: 'create_prorations',
    });
  }

  async createStripeCustomer(userId: number): Promise<string> {
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

  async createCheckoutSession(
    conversationId: number,
    userId: number,
    url: string,
  ): Promise<{ url: string; discountMessage: string }> {
    const conv = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conv) throw new BadRequestException('Conversation introuvable');
    if (!conv.price || conv.price <= 0)
      throw new BadRequestException('Prix invalide pour cette conversation');

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['currentSubscription'],
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    if (!user.stripe_id) {
      user.stripe_id = await this.createStripeCustomer(user.id);
      await this.userRepo.save(user);
    }

    let price = conv.price;
    let discountAppliedInfo = '';
    let discountMessage = '';

    // Réduction d'abonnement pour DeliverySteps
    if (conv.adType === 'DeliverySteps' && user.currentSubscription) {
      const subName = user.currentSubscription.name;
      let discountPercentage = 0;

      if (subName === 'Starter') {
        discountPercentage = 0.05;
        discountAppliedInfo = ' (Réduction Starter 5%)';
      } else if (subName === 'Premium') {
        discountPercentage = 0.09;
        discountAppliedInfo = ' (Réduction Premium 9%)';
      } else if (subName === 'Free') {
        const potentialSaving = conv.price * 0.09; // Premium discount
        discountMessage = `Passez au Premium et économisez ${potentialSaving.toFixed(2)}€ sur cette transaction !`;
      }

      if (discountPercentage > 0) {
        price = price * (1 - discountPercentage);
      }
    }

    // Réduction trader pour ReleaseCartAd
    if (conv.adType === 'ReleaseCartAds') {
      // Récupérer l'annonce pour obtenir l'utilisateur qui l'a postée
      const releaseCartAd = await this.releaseRepo.findOne({
        where: { id: conv.adId },
        relations: ['postedBy'],
      });

      if (releaseCartAd && releaseCartAd.postedBy) {
        // Vérifier si l'utilisateur qui a posté l'annonce est un trader avec une réduction
        const trader = await this.traderRepo.findOne({
          where: { user: { id: releaseCartAd.postedBy.id } },
        });

        if (trader && trader.reduction_percent > 0) {
          const traderDiscountPercentage = trader.reduction_percent / 100;
          const originalPrice = price;
          price = price * (1 - traderDiscountPercentage);
          discountAppliedInfo = ` (Réduction commerçant ${trader.reduction_percent}%)`;
          
          // Ajouter un message informatif sur la réduction
          if (!discountMessage) {
            discountMessage = `Réduction de ${trader.reduction_percent}% appliquée grâce à votre statut de partenaire !`;
          }
        }
      }
    }

    let additionalPrice = 0;
    let additionalName = ''; 

    if (conv.adType === 'DeliverySteps') {
      const deliveryStep = await this.deliveryRepo.findOne({
      where: { id: conv.adId },
      relations: ['arrivalLocation'],
      });

      if (deliveryStep && deliveryStep.arrivalLocation && deliveryStep.arrivalLocation.price && deliveryStep.arrivalLocation.price > 0) {
      additionalPrice = deliveryStep.arrivalLocation.price;
      additionalName = deliveryStep.arrivalLocation.name + ' (' + deliveryStep.arrivalLocation.city + ')';
      }
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Paiement Ecodeli - ${conv.adType}${discountAppliedInfo}`,
          },
          unit_amount: Math.round(price * 100),
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
      success_url: url + '&payment=sucess',
      cancel_url: url + '&payment=cancel',
    });

    return { url: session.url ?? '', discountMessage };
  }

  async handleEvent(event: any) {
    if (!event || !event.type) {
      console.error("L'événement ne contient pas de type valide.");
      return;
    }

    // Aiguillage des événements de checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Si c'est un abonnement, on attend les webhooks dédiés
      if (session.mode === 'subscription') {
        console.log('Checkout session pour un abonnement complétée. En attente des webhooks de souscription.');
        // On ne fait rien ici, car les webhooks `customer.subscription.*` et `invoice.*` vont s'en charger.
        return;
      }
      
      // Si c'est un paiement unique, on traite le paiement de l'annonce
      if (session.mode === 'payment') {
        console.log('Traitement de checkout.session.completed pour un paiement unique.');
        await this.handlePaymentSuccess(event);
        return;
      }
    }

    // Gestion des autres événements
    switch (event.type) {
      case 'checkout.session.failed':
        await this.handlePaymentFailure(event);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_succeeded':
        await this.handleSubscriptionPaymentSucceeded(event);
        break;
      case 'invoice.payment_failed':
        await this.handleSubscriptionPaymentFailed(event);
        break;
      default:
        console.log(`Événement non pris en charge : ${event.type}`);
    }
  }

  private async handleSubscriptionCreated(event: any) {
    const subscription = event.data.object;
    console.log('[Stripe] handleSubscriptionCreated - subscription:', subscription);

    const user = await this.userRepo.findOne({
      where: { stripe_id: subscription.customer },
    });

    if (!user) {
      console.error('[Stripe] Utilisateur non trouvé pour le customer:', subscription.customer);
      return;
    }

    // Trouver l'abonnement correspondant
    const dbSubscription = await this.subscriptionRepo.findOne({
      where: { stripe_id: subscription.items.data[0].price.id },
    });

    if (dbSubscription) {
      // S'assurer qu'il n'y a qu'un seul abonnement actif
      user.current_subscription_id = dbSubscription.id;
      user.subscription_stripe_id = subscription.id;
      user.subscription_end_date = new Date(subscription.current_period_end * 1000);
      await this.userRepo.save(user);

      // Créer un paiement d'abonnement
      const subscriptionPayment = this.subscriptionPaymentRepo.create({
        user: user,
        subscription: dbSubscription,
        amount: dbSubscription.price,
        status: PaymentStatus.COMPLETED,
      });
      await this.subscriptionPaymentRepo.save(subscriptionPayment);

      console.log('[Stripe] Abonnement créé pour l\'utilisateur:', user.id);
    }
  }

  private async handleSubscriptionUpdated(event: any) {
    const subscription = event.data.object;
    console.log('[Stripe] handleSubscriptionUpdated - subscription:', subscription);

    const user = await this.userRepo.findOne({
      where: { stripe_id: subscription.customer },
    });

    if (user) {
      // Mettre à jour la date de fin d'abonnement
      user.subscription_end_date = new Date(subscription.current_period_end * 1000);
      
      // Si l'abonnement a changé de prix, mettre à jour l'abonnement actuel
      if (subscription.items.data.length > 0) {
        const newPriceId = subscription.items.data[0].price.id;
        const newSubscription = await this.subscriptionRepo.findOne({
          where: { stripe_id: newPriceId },
        });
        
        if (newSubscription && newSubscription.id !== user.current_subscription_id) {
          user.current_subscription_id = newSubscription.id;
          
          // Créer un nouveau paiement pour le changement d'abonnement
          const subscriptionPayment = this.subscriptionPaymentRepo.create({
            user: user,
            subscription: newSubscription,
            amount: newSubscription.price,
            status: PaymentStatus.COMPLETED,
          });
          await this.subscriptionPaymentRepo.save(subscriptionPayment);
        }
      }
      
      await this.userRepo.save(user);
      console.log('[Stripe] Abonnement mis à jour pour l\'utilisateur:', user.id);
    }
  }

  private async handleSubscriptionDeleted(event: any) {
    const subscription = event.data.object;
    console.log('[Stripe] handleSubscriptionDeleted - subscription:', subscription);

    const user = await this.userRepo.findOne({
      where: { stripe_id: subscription.customer },
    });

    if (user) {
      // Assigner le plan Free par défaut
      const freePlan = await this.subscriptionRepo.findOne({
        where: { name: 'Free' },
      });

      if (freePlan) {
        user.current_subscription_id = freePlan.id;
        user.subscription_stripe_id = null;
        user.subscription_end_date = null;
        await this.userRepo.save(user);
        console.log('[Stripe] Utilisateur mis sur le plan Free:', user.id);
      }
    }
  }

  private async handleSubscriptionPaymentSucceeded(event: any) {
    const invoice = event.data.object;
    console.log(
      '[Stripe] handleSubscriptionPaymentSucceeded - invoice:',
      invoice,
    );

    if (invoice.subscription) {
      const user = await this.userRepo.findOne({
        where: { stripe_id: invoice.customer },
      });

      if (user) {
        // The invoice's billing period end is the new subscription end date.
        // This avoids an extra API call and the typing issue.
        if (invoice.period_end) {
          user.subscription_end_date = new Date(invoice.period_end * 1000);
          await this.userRepo.save(user);
          console.log(
            '[Stripe] Date de fin d\'abonnement mise à jour pour l\'utilisateur:',
            user.id,
          );
        }

        const subscription = await this.subscriptionRepo.findOne({
          where: { stripe_id: invoice.lines.data[0].price.id },
        });

        if (subscription) {
          // Créer un paiement d'abonnement
          const subscriptionPayment = this.subscriptionPaymentRepo.create({
            user: user,
            subscription: subscription,
            amount: subscription.price,
            status: PaymentStatus.COMPLETED,
          });
          await this.subscriptionPaymentRepo.save(subscriptionPayment);

          console.log(
            '[Stripe] Paiement d\'abonnement enregistré:',
            subscriptionPayment.id,
          );
        }
      }
    }
  }

  private async handleSubscriptionPaymentFailed(event: any) {
    const invoice = event.data.object;
    console.log('[Stripe] handleSubscriptionPaymentFailed - invoice:', invoice);

    if (invoice.subscription) {
      const user = await this.userRepo.findOne({
        where: { stripe_id: invoice.customer },
      });

      if (user) {
        const subscription = await this.subscriptionRepo.findOne({
          where: { stripe_id: invoice.lines.data[0].price.id },
        });

        if (subscription) {
          // Créer un paiement d'abonnement échoué
          const subscriptionPayment = this.subscriptionPaymentRepo.create({
            user: user,
            subscription: subscription,
            amount: subscription.price,
            status: PaymentStatus.FAILED,
          });
          await this.subscriptionPaymentRepo.save(subscriptionPayment);

          console.log('[Stripe] Paiement d\'abonnement échoué enregistré:', subscriptionPayment.id);
        }
      }
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

    // Pour les ServiceProvisions : mettre la conversation en ongoing et marquer le créneau comme indisponible
    if (conversation.adType === 'ServiceProvisions') {
      conversation.status = ConversationStatus.Ongoing;
      await this.conversationRepo.save(conversation);
      
      // Marquer le créneau comme indisponible
      if (conversation.providerScheduleId) {
        const schedule = await this.providerScheduleRepo.findOne({
          where: { id: conversation.providerScheduleId }
        });
        if (schedule) {
          schedule.status = ProviderScheduleStatus.UNAVAILABLE;
          await this.providerScheduleRepo.save(schedule);
          console.log('[Stripe] Créneau marqué comme indisponible:', schedule.id);
        }
      }
      
      console.log('[Stripe] ServiceProvisions - Conversation en ongoing, créneau marqué comme indisponible');
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
          case 'ReleaseCartAds':
            // Celui qui a créé l'annonce reçoit le mail
            if (ad.postedBy) {
              recipientEmail = ad.postedBy.email;
              recipientFirstName = ad.postedBy.first_name || '';
            } else if (ad.deliveryAd && ad.deliveryAd.postedBy) {
              recipientEmail = ad.deliveryAd.postedBy.email;
              recipientFirstName = ad.deliveryAd.postedBy.first_name || '';
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