import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ProviderRatingResponseDto } from './dto/provider-rating-response.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('submit')
  async submitRating(@Body() dto: CreateRatingDto) {
    return this.ratingsService.submitRating(dto);
  }

  @Get('provider/:providerId/stats')
  async getProviderStats(@Param('providerId') providerId: string): Promise<ProviderRatingResponseDto> {
    return this.ratingsService.getProviderRatingStats(parseInt(providerId));
  }

  @Get('token/:token')
  async getRatingByToken(@Param('token') token: string) {
    return this.ratingsService.getRatingByToken(token);
  }
} 