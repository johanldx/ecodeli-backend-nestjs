import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private storageService: StorageService,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    file: Express.Multer.File,
  ): Promise<Invoice> {
    const documentUrl = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      'Invoice', // dossier personnalisé pour les factures
    );

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      documentUrl,
      status: InvoiceStatus.CREATED,
    });

    return this.invoiceRepository.save(invoice);
  }

  findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find();
  }

  findAllByUser(userId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({ where: { userId } });
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneBy({ id });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    if (invoice.documentUrl) {
      await this.storageService.deleteFile(invoice.documentUrl);
    }
    await this.invoiceRepository.delete(id);
  }

  async updateStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = status;
    return this.invoiceRepository.save(invoice);
  }
}
