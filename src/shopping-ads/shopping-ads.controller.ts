import { Controller, Post, Body, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateShoppingAdDto } from './dto/create-shopping-ad.dto';
import { UpdateShoppingAdDto } from './dto/update-shopping-ad.dto';
import { ShoppingAdResponseDto } from './dto/shopping-ad-response.dto'; 
import { ShoppingAdsService } from './shopping-ads.service';

@ApiTags('Shopping Ads')  
@ApiBearerAuth() 
@Controller('shopping-ads')
export class ShoppingAdsController {
  constructor(private readonly shoppingAdsService: ShoppingAdsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Shopping Ad created successfully', type: ShoppingAdResponseDto })
  async create(@Body() dto: CreateShoppingAdDto) {
    return this.shoppingAdsService.create(dto);  
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Returns the list of shopping ads', type: [ShoppingAdResponseDto] })
  async findAll(@Query() query: any) {
    return this.shoppingAdsService.findAll(query);  
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Returns the shopping ad by ID', type: ShoppingAdResponseDto })
  async findOne(@Param('id') id: number) {
    return this.shoppingAdsService.findOne(id); 
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Shopping Ad updated successfully', type: ShoppingAdResponseDto })
  async update(@Param('id') id: number, @Body() dto: UpdateShoppingAdDto) {
    return this.shoppingAdsService.update(id, dto); 
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Shopping Ad deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.shoppingAdsService.remove(id);  
  }
}
