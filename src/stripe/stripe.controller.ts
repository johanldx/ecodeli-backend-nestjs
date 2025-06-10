import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { User } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  async createCheckout(@Body() body: { conversationId: number }, @CurrentUser() user: User) {
    if (!body.conversationId) {
      throw new BadRequestException('conversationId manquant');
    }

    const session = await this.stripeService.createCheckoutSession(body.conversationId, user.id);
    return session;
  }
}
