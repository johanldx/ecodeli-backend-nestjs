import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { CurrentSubscriptionResponseDto } from './dto/current-subscription-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns the list of subscriptions',
    type: [SubscriptionResponseDto],
  })
  async findAll(@Query() query: any) {
    return this.subscriptionsService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns the current user subscription',
    type: CurrentSubscriptionResponseDto,
  })
  async getCurrentSubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getCurrentUserSubscription(user.id);
  }

  @Get('portal')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Returns Stripe customer portal URL',
  })
  async createPortalSession(
    @CurrentUser() user: User,
    @Query('return_url') returnUrl: string,
  ) {
    if (!returnUrl) {
      returnUrl = 'http://localhost:5173/app/account';
    }
    return this.subscriptionsService.createCustomerPortalSession(user.id, returnUrl);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns a subscription by ID',
    type: SubscriptionResponseDto,
  })
  async findOne(@Param('id') id: number) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async update(
    @Param('id') id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async remove(@Param('id') id: number) {
    return this.subscriptionsService.remove(id);
  }

  @Post('reset-stripe')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Abonnements Stripe réinitialisés',
  })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async resetStripeSubscriptions() {
    // Supprimer tous les abonnements existants
    await this.subscriptionsService.resetStripeSubscriptions();
    return { message: 'Abonnements Stripe réinitialisés avec succès' };
  }

  @Get('stripe-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Statut de la configuration Stripe',
  })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async getStripeStatus() {
    return this.subscriptionsService.getStripeStatus();
  }
}
