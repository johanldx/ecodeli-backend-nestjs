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
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { ReleaseCartAdsService } from './release-cart-ads.service';
import { CreateReleaseCartAdDto } from './dto/create-release-cart-ad.dto';
import { UpdateReleaseCartAdDto } from './dto/update-release-cart-ad.dto';
import { ReleaseCartAdResponseDto } from './dto/release-cart-ad-response.dto';
import { User } from 'src/users/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Release Cart Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('release-cart-ads')
export class ReleaseCartAdsController {
  constructor(private readonly releaseCartAdsService: ReleaseCartAdsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Release Cart Ad created successfully',
    type: ReleaseCartAdResponseDto,
  })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateReleaseCartAdDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    if (!images || !images.length) {
      throw new BadRequestException('Au moins une image est requise');
    }

    return this.releaseCartAdsService.create(user, dto, images);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns the list of release cart ads',
    type: [ReleaseCartAdResponseDto],
  })
  async findAll(@Query() query: any, @CurrentUser() user: User) {
    return this.releaseCartAdsService.findAll(user, query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns the release cart ad by ID',
    type: ReleaseCartAdResponseDto,
  })
  async findOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.releaseCartAdsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Release Cart Ad updated successfully',
    type: ReleaseCartAdResponseDto,
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateReleaseCartAdDto,
    @CurrentUser() user: User,
  ) {
    return this.releaseCartAdsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'Release Cart Ad deleted successfully',
  })
  @HttpCode(204)
  async remove(@Param('id') id: number, @CurrentUser() user: User) {
    return this.releaseCartAdsService.remove(id, user);
  }
}
