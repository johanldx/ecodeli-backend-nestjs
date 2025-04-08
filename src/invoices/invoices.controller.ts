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
  @ApiResponse({
    status: 201,
    description: 'Facture créée avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide (valeurs manquantes ou mal formatées)',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur (ex: problème lors de l’upload sur S3)',
  })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto, file);
  }

  @Get()
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.invoicesService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateInvoiceStatusDto,
  ): Promise<Invoice> {
    return this.invoicesService.updateStatus(id, body.status);
  }
}
