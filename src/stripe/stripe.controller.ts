// stripe.controller.ts
import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  // Endpoint pour créer une session de paiement pour un abonnement
  @Post('create-subscription-session')
  @ApiOperation({ summary: 'Créer une session de paiement pour un abonnement' })
  async createSubscriptionSession(
    @Body() body: { amount: number; userId: string },
  ) {
    try {
      const session = await this.stripeService.createSubscriptionSession(
        body.amount,
        body.userId,
      );
      return { sessionId: session.sessionId };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Endpoint pour créer une session de paiement pour une annonce
  @Post('create-ad-payment-session')
  @ApiOperation({ summary: 'Créer une session de paiement pour une annonce' })
  async createAdPaymentSession(
    @Body() body: { adType: string; adId: string; amount: number },
  ) {
    try {
      const session = await this.stripeService.createAdPaymentSession(
        body.adType,
        body.adId,
        body.amount,
      );
      return { sessionId: session.sessionId };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Webhook pour gérer les événements Stripe (ex: paiement réussi, échec de paiement, etc.)
  @Post('webhook')
  @ApiOperation({ summary: 'Gérer les événements Stripe (ex: paiement réussi)' })
  async handleStripeWebhook(@Req() request: Request, @Res() response: Response) {
    const sig = request.headers['stripe-signature'];

    // Vérifiez si la signature est une chaîne de caractères avant de l'utiliser
    if (typeof sig !== 'string') {
      return response.status(HttpStatus.BAD_REQUEST).send('Invalid signature');
    }

    const payload = request.body;

    try {
      // Vérification de la signature de l'événement Stripe pour sécuriser la requête
      const event = this.stripeService.stripeInstance.webhooks.constructEvent(
        payload,
        sig,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '',
      );

      // Traitement en fonction du type d'événement
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          // Logique à appliquer quand une session de paiement est terminée avec succès
          console.log(`Payment for session ${session.id} was successful!`);
          break;
        // Ajoutez d'autres cas d'événements ici si nécessaire

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Retourner une réponse 200 pour confirmer que l'événement a été reçu
      response.status(HttpStatus.OK).send({ received: true });
    } catch (err) {
      // Si le webhook échoue, retourner un message d'erreur
      console.error('Webhook error:', err.message);
      response.status(HttpStatus.BAD_REQUEST).send(`Webhook error: ${err.message}`);
    }
  }
}
