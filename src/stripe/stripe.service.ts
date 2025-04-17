import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../subscriptions/entities/subscriptions.entity';
import { SubscriptionPayment } from '../subscription-payments/entities/subscription-payment.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPayment)
    private subscriptionPaymentRepository: Repository<SubscriptionPayment>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in the configuration');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  get stripeInstance(): Stripe {
    return this.stripe;
  }

  // Créer une session pour le paiement d'abonnement
  async createSubscriptionSession(amount: number, userId: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Subscription Plan',
            },
            unit_amount: amount * 100, // Montant en cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://your-site.com/success?userId=${userId}`,
      cancel_url: 'http://your-site.com/cancel',
    });

    return { sessionId: session.id };
  }

  // Créer une session pour le paiement d'une annonce
  async createAdPaymentSession(adType: string, adId: string, amount: number) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ad Payment: ${adType}`,
            },
            unit_amount: amount * 100, // Montant en cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://your-site.com/ad-success?adId=${adId}`,
      cancel_url: 'http://your-site.com/ad-cancel',
    });

    return { sessionId: session.id };
  }
}
