import { Controller, Get, Post, Query, Body, BadRequestException } from '@nestjs/common';
import { OrderTrackingService } from './order-tracking.service';

@Controller('order-tracking')
export class OrderTrackingController {
  constructor(private readonly orderTrackingService: OrderTrackingService) {}

  @Get()
  async getOrderTracking(@Query('email') email: string, @Query('conversationId') conversationId: number) {
    if (!email || !conversationId) throw new BadRequestException('Email et conversationId requis');
    return this.orderTrackingService.getOrderTracking(email, Number(conversationId));
  }

  @Post('validate')
  async validateOrder(@Body('email') email: string, @Body('conversationId') conversationId: number) {
    if (!email || !conversationId) throw new BadRequestException('Email et conversationId requis');
    return this.orderTrackingService.validateOrder(email, Number(conversationId));
  }
} 