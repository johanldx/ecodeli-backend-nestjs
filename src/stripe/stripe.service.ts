import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { AdPayment } from 'src/ad-payments/entities/ad-payment.entity';
import { PaymentStatus } from 'src/subscription-payments/entities/subscription-payment.entity';
import { PaymentTypes } from 'src/ad-payments/entities/payment.enums';
import { User } from 'src/users/user.entity';

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
) {
  const key = this.configService.get<string>('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  this.stripe = new Stripe(key, { apiVersion: '2025-05-28.basil' });
}

  async createCheckoutSession(conversationId: number, userId: number) {
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

    const payment = this.paymentRepo.create({
      user,
      amount: conv.price,
      payment_type: conv.adType as unknown as PaymentTypes,
      reference_id: conv.adId,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepo.save(payment);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
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
      ],
      metadata: {
        conversationId: String(conv.id),
        adId: String(conv.adId),
        adType: conv.adType,
        paymentId: String(payment.id),
        userId: String(userId),
      },
      success_url: 'http://localhost:5173/payment/success',
      cancel_url: 'http://localhost:5173/payment/cancel',
    });

    return { url: session.url };
  }
}