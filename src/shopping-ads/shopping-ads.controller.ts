import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateShoppingAdDto } from './dto/create-shopping-ad.dto';
import { UpdateShoppingAdDto } from './dto/update-shopping-ad.dto';
import { ShoppingAdResponseDto } from './dto/shopping-ad-response.dto';
import { ShoppingAdsService } from './shopping-ads.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shopping Ads')
@ApiBearerAuth()
@Controller('shopping-ads')
export class ShoppingAdsController {
  constructor(private readonly shoppingAdsService: ShoppingAdsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async findMine(@CurrentUser() user: User) {
    return this.shoppingAdsService.findByUser(user.id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: ShoppingAdResponseDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateShoppingAdDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    if (!images || !images.length) {
      throw new Error('Au moins une image est requise');
    }

    return this.shoppingAdsService.create(dto.posted_by, dto, images);
  }

  @Get()
  @ApiResponse({ status: 200, type: [ShoppingAdResponseDto] })
  async findAll(@Query() query: any) {
    return this.shoppingAdsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: ShoppingAdResponseDto })
  async findOne(@Param('id') id: number) {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('ID invalide');
    }
    return this.shoppingAdsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, type: ShoppingAdResponseDto })
  async update(
    @Param('id') id: number,
    @CurrentUser() user: User,
    @Body() dto: UpdateShoppingAdDto,
    @UploadedFiles() newImages?: Express.Multer.File[],
  ) {
    if (!dto.posted_by) {
      throw new Error('The "posted_by" field is required');
    }
    return this.shoppingAdsService.update(id, dto.posted_by, dto, newImages);
  }

  @Delete(':id')
  @ApiResponse({ status: 200 })
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    return this.shoppingAdsService.remove(id);
  }
}
