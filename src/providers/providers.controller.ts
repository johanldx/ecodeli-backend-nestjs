import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { UpdateDeliveryPersonStatusDto } from '../delivery-persons/dto/update-delivery-person-status.dto';
import { StorageService } from '../storage/storage.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly service: ProvidersService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identity_card_document', maxCount: 1 },
      { name: 'proof_of_business_document', maxCount: 1 },
      { name: 'certification_documents', maxCount: 10 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Créer un fournisseur avec documents' })
  @ApiBody({
    description: 'Upload des documents nécessaires + infos du provider',
    schema: {
      type: 'object',
      required: [
        'user_id',
        'identity_card_document',
        'proof_of_business_document',
        'bank_account',
        'name',
        'description',
      ],
      properties: {
        user_id: { type: 'integer', example: 1 },
        bank_account: {
          type: 'string',
          example: 'FR7630001007941234567890185',
        },
        name: { type: 'string', example: 'Mon fournisseur' },
        description: { type: 'string', example: 'Description du fournisseur' },
        identity_card_document: { type: 'string', format: 'binary' },
        proof_of_business_document: { type: 'string', format: 'binary' },
        certification_documents: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: ProviderResponseDto })
  async create(
    @Body() dto: CreateProviderDto,
    @UploadedFiles()
    files: {
      identity_card_document?: Express.Multer.File[];
      proof_of_business_document?: Express.Multer.File[];
      certification_documents?: Express.Multer.File[];
    },
    @CurrentUser() user: User,
  ) {
    assertUserOwnsResourceOrIsAdmin(user, dto.user_id);

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;

    const idDoc = files.identity_card_document?.[0];
    const proof = files.proof_of_business_document?.[0];
    const certs = files.certification_documents || [];

    if (!idDoc || !proof) {
      throw new BadRequestException('Les documents requis sont manquants.');
    }

    if (idDoc.size > maxSize || !allowedTypes.includes(idDoc.mimetype)) {
      throw new BadRequestException(
        'Document identité invalide (max 5MB, jpg/png/pdf)',
      );
    }

    if (proof.size > maxSize || !allowedTypes.includes(proof.mimetype)) {
      throw new BadRequestException(
        'Justificatif d\'activité invalide (max 5MB, jpg/png/pdf)',
      );
    }

    dto.identity_card_document = await this.storage.uploadFile(
      idDoc.buffer,
      idDoc.originalname,
      'provider-docs',
    );

    dto.proof_of_business_document = await this.storage.uploadFile(
      proof.buffer,
      proof.originalname,
      'provider-docs',
    );

    dto.certification_documents = [];

    for (const file of certs) {
      if (file.size > maxSize || !allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Un des documents de certification est invalide.',
        );
      }

      const url = await this.storage.uploadFile(
        file.buffer,
        file.originalname,
        'provider-docs',
      );

      dto.certification_documents.push(url);
    }

    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Liste des providers' })
  @ApiResponse({ status: 200, type: [ProviderResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Un provider par ID' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Modifier un provider' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProviderDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Changer le statut du provider' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeliveryPersonStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer un provider' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
