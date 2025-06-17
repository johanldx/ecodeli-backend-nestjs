import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { User } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  async createCheckout(@Body() body: { conversationId: number, url: string }, @CurrentUser() user: User) {
    if (!body.conversationId) {
      throw new BadRequestException('conversationId manquant');
    }

    const session = await this.stripeService.createCheckoutSession(body.conversationId, user.id, body.url);
    return session;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(@Body() payload: any, @Headers('Stripe-Signature') signature: string) {
    // Récupère la clé secrète du webhook
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!endpointSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined in configuration');
    }
    
    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed: ${err.message}`);
      return { message: 'Webhook Error: ' + err.message };
    }

    await this.stripeService.handleEvent(event);
    return { message: 'Webhook traité avec succès' };
  }
}
