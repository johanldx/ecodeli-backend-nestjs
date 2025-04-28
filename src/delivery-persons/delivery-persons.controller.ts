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
import { DeliveryPersonsService } from './delivery-persons.service';
import { CreateDeliveryPersonDto } from './dto/create-delivery-person.dto';
import { UpdateDeliveryPersonDto } from './dto/update-delivery-person.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { UpdateDeliveryPersonStatusDto } from './dto/update-delivery-person-status.dto';
import { DeliveryPersonResponseDto } from './dto/delivery-person-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('DeliveryPersons')
@Controller('delivery-persons')
export class DeliveryPersonsController {
  constructor(
    private readonly service: DeliveryPersonsService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identity_card_document', maxCount: 1 },
      { name: 'driver_license_document', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary:
      'Create a delivery person with identity & license files (user_id required)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Required: user_id, identity document, driver license. Optional: bank_account',
    schema: {
      type: 'object',
      required: [
        'user_id',
        'identity_card_document',
        'driver_license_document',
      ],
      properties: {
        user_id: { type: 'integer', example: 5 },
        bank_account: {
          type: 'string',
          example: 'FR7630001007941234567890185',
        },
        identity_card_document: {
          type: 'string',
          format: 'binary',
          description: 'Upload identity card (PDF, JPG, PNG)',
        },
        driver_license_document: {
          type: 'string',
          format: 'binary',
          description: 'Upload driver license (PDF, JPG, PNG)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Delivery person created with uploaded documents',
    type: DeliveryPersonResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateDeliveryPersonDto & { user_id: number },
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      identity_card_document?: Express.Multer.File[];
      driver_license_document?: Express.Multer.File[];
    } = {},
  ) {
    if (!dto.user_id) {
      throw new BadRequestException('user_id is required in the body');
    }

    assertUserOwnsResourceOrIsAdmin(user, dto.user_id);

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    const idCard = files.identity_card_document?.[0];
    const license = files.driver_license_document?.[0];

    if (!idCard) {
      throw new BadRequestException('identity_card_document is required');
    }

    if (!license) {
      throw new BadRequestException('driver_license_document is required');
    }

    if (idCard.size > maxSize || !allowedTypes.includes(idCard.mimetype)) {
      throw new BadRequestException(
        'Invalid identity document (max 5MB, allowed types: JPG, PNG, PDF)',
      );
    }

    if (license.size > maxSize || !allowedTypes.includes(license.mimetype)) {
      throw new BadRequestException(
        'Invalid driver license (max 5MB, allowed types: JPG, PNG, PDF)',
      );
    }

    dto.identity_card_document = await this.storage.uploadFile(
      idCard.buffer,
      idCard.originalname,
      'delivery-docs',
    );
    dto.driver_license_document = await this.storage.uploadFile(
      license.buffer,
      license.originalname,
      'delivery-docs',
    );

    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery persons' })
  @ApiResponse({
    status: 200,
    description: 'List of all delivery persons',
    type: [DeliveryPersonResponseDto],
  })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery person by ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery person found',
    type: DeliveryPersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Delivery person not found' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update delivery person (resets status to pending)',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery person updated',
    type: DeliveryPersonResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryPersonDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery person' })
  @ApiResponse({ status: 200, description: 'Delivery person deleted' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually update the validation status' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: DeliveryPersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Delivery person not found' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryPersonStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }
}
