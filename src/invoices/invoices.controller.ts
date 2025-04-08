import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        providerId: { type: 'number' },
        userId: { type: 'number' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['providerId', 'userId', 'file'],
    },
  })
  @ApiOperation({ summary: 'Créer une nouvelle facture' })
  @ApiResponse({ status: 201, description: 'Facture créée avec succès', type: Invoice })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 500, description: 'Erreur serveur (upload ou base)' })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les factures visibles' })
  @ApiResponse({ status: 200, description: 'Liste des factures', type: [Invoice] })
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une facture par son ID' })
  @ApiResponse({ status: 200, description: 'Facture trouvée', type: Invoice })
  @ApiResponse({ status: 404, description: 'Facture non trouvée' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une facture' })
  @ApiResponse({ status: 200, description: 'Facture supprimée' })
  @ApiResponse({ status: 404, description: 'Facture non trouvée' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoicesService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d’une facture' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Invoice })
  @ApiResponse({ status: 400, description: 'Statut invalide' })
  @ApiResponse({ status: 404, description: 'Facture non trouvée' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateInvoiceStatusDto,
  ): Promise<Invoice> {
    return this.invoicesService.updateStatus(id, body.status);
  }
}
