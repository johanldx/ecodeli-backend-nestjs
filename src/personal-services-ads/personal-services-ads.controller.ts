import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { PersonalServicesAdsService } from './personal-services-ads.service';
import { CreatePersonalServiceAdDto } from './dto/create-personal-service-ad.dto';
import { UpdatePersonalServiceAdDto } from './dto/update-personal-service-ad.dto';
import { PersonalServiceAdDto } from './dto/personal-service-ad.dto';
import { User } from '../users/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('Personal Service Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal-service-ads')
export class PersonalServicesAdsController {
  constructor(private readonly service: PersonalServicesAdsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new personal service ad' })
  @ApiBody({ type: CreatePersonalServiceAdDto })
  @ApiResponse({ status: 201, type: PersonalServiceAdDto })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreatePersonalServiceAdDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<PersonalServiceAdDto> {
    const ad = await this.service.create(user.id, dto, images);
    return ad;
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal service ads' })
  @ApiResponse({ status: 200, type: [PersonalServiceAdDto] })
  findAll(): Promise<PersonalServiceAdDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a personal service ad by ID' })
  @ApiResponse({ status: 200, type: PersonalServiceAdDto })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PersonalServiceAdDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a personal service ad' })
  @ApiResponse({ status: 200, type: PersonalServiceAdDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalServiceAdDto,
  ): Promise<PersonalServiceAdDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a personal service ad' })
  @ApiResponse({ status: 200, description: 'Deleted or cancelled' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ action: 'deleted' | 'cancelled' }> {
    return this.service.remove(id);
  }
}
