import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SubscriptionPaymentsService } from './subscription-payments.service';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';
import { UpdateSubscriptionPaymentDto } from './dto/update-subscription-payment.dto';
import { SubscriptionPaymentResponseDto } from './dto/subscription-payment-response.dto'; // Import du DTO de réponse
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@ApiTags('Subscription Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscription-payments')
export class SubscriptionPaymentsController {
  constructor(
    private readonly subscriptionPaymentsService: SubscriptionPaymentsService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Subscription payment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(
    @Body() createSubscriptionPaymentDto: CreateSubscriptionPaymentDto,
  ) {
    return this.subscriptionPaymentsService.create(
      createSubscriptionPaymentDto,
    );
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns the list of subscription payments',
    type: [SubscriptionPaymentResponseDto],
  })
  async findAll() {
    return this.subscriptionPaymentsService.findAll();
  }

  @Get('/me')
  @ApiResponse({
    status: 200,
    description: 'Returns subscription payments for the current user',
    type: [SubscriptionPaymentResponseDto],
  })
  async findMine(@CurrentUser() user: User) {
    return this.subscriptionPaymentsService.findMine(user.id);
  }

  @Get('/user/:userId')
  @ApiResponse({
    status: 200,
    description: 'Returns subscription payments for a specific user',
    type: [SubscriptionPaymentResponseDto],
  })
  async findForUser(@Param('userId') userId: number) {
    return this.subscriptionPaymentsService.findForUser(userId);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns a subscription payment by ID',
    type: SubscriptionPaymentResponseDto,
  })
  async findOne(@Param('id') id: number) {
    return this.subscriptionPaymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Subscription payment updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async update(
    @Param('id') id: number,
    @Body() updateSubscriptionPaymentDto: UpdateSubscriptionPaymentDto,
  ) {
    return this.subscriptionPaymentsService.update(
      id,
      updateSubscriptionPaymentDto,
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Subscription payment deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admins' })
  async remove(@Param('id') id: number) {
    return this.subscriptionPaymentsService.remove(id);
  }
}
