import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  HttpCode,
  BadRequestException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TradersService } from './traders.service';
import { CreateTraderDto } from './dto/create-trader.dto';
import { UpdateTraderDto } from './dto/update-trader.dto';
import { TraderResponseDto } from './dto/trader-response.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateDeliveryPersonStatusDto } from 'src/delivery-persons/dto/update-delivery-person-status.dto';
import { UpdateTraderStatusDto } from './dto/update-trader-status.dto';

@ApiTags('Traders')
@Controller('traders')
export class TradersController {
  constructor(
    private readonly service: TradersService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identity_card_document', maxCount: 1 },
      { name: 'proof_of_business_document', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary:
      'Create a trader with identity & business documents (user_id required)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Required: user_id, identity document, proof of business document. Optional: bank_account',
    schema: {
      type: 'object',
      required: [
        'user_id',
        'identity_card_document',
        'proof_of_business_document',
      ],
      properties: {
        user_id: {
          type: 'number',
          example: 1,
        },
        bank_account: {
          type: 'string',
          example: 'FR7630001007941234567890185',
        },
        identity_card_document: {
          type: 'string',
          format: 'binary',
          description: 'Upload identity card (PDF, JPG, PNG)',
        },
        proof_of_business_document: {
          type: 'string',
          format: 'binary',
          description: 'Upload proof of business (PDF, JPG, PNG)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Trader created with uploaded documents',
    type: TraderResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateTraderDto & { user_id: number },
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      identity_card_document?: Express.Multer.File[];
      proof_of_business_document?: Express.Multer.File[];
    } = {},
  ) {
    if (!dto.user_id) {
      throw new BadRequestException('user_id is required in the body');
    }

    assertUserOwnsResourceOrIsAdmin(user, dto.user_id);

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    const idCard = files.identity_card_document?.[0];
    const businessDoc = files.proof_of_business_document?.[0];

    if (!idCard) {
      throw new BadRequestException('identity_card_document is required');
    }

    if (!businessDoc) {
      throw new BadRequestException('proof_of_business_document is required');
    }

    if (idCard.size > maxSize || !allowedTypes.includes(idCard.mimetype)) {
      throw new BadRequestException(
        'Invalid identity document (max 5MB, allowed types: JPG, PNG, PDF)',
      );
    }

    if (
      businessDoc.size > maxSize ||
      !allowedTypes.includes(businessDoc.mimetype)
    ) {
      throw new BadRequestException(
        'Invalid proof of business document (max 5MB, allowed types: JPG, PNG, PDF)',
      );
    }

    dto.identity_card_document = await this.storage.uploadFile(
      idCard.buffer,
      idCard.originalname,
      'trader-docs',
    );
    dto.proof_of_business_document = await this.storage.uploadFile(
      businessDoc.buffer,
      businessDoc.originalname,
      'trader-docs',
    );

    dto.user_id = Number(dto.user_id);

    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all traders' })
  @ApiResponse({
    status: 200,
    description: 'List of all traders',
    type: [TraderResponseDto],
  })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trader by ID' })
  @ApiResponse({
    status: 200,
    description: 'Trader found',
    type: TraderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trader not found' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/monthly-stats')
  @ApiOperation({ summary: 'Get trader monthly statistics' })
  @ApiResponse({
    status: 200,
    description: 'Trader monthly statistics',
    schema: {
      type: 'object',
      properties: {
        totalPaid: { type: 'number' },
        totalEarned: { type: 'number' },
        reductionAmount: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Trader not found' })
  @UseGuards(JwtAuthGuard)
  getMonthlyStats(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMonthlyStats(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update trader (resets status to pending)',
  })
  @ApiResponse({
    status: 200,
    description: 'Trader updated',
    type: TraderResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTraderDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete trader' })
  @ApiResponse({ status: 200, description: 'Trader deleted' })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually update the validation status and reduction' })
  @ApiResponse({
    status: 200,
    description: 'Status and reduction updated successfully',
    type: TraderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Trader not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTraderStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status, dto.reduction_percent);
  }
}
