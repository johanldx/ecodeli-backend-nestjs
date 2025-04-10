import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoicesService {
  private readonly s3 = new S3();

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    file: Express.Multer.File,
  ): Promise<Invoice> {
    const bucket = process.env.AWS_S3_BUCKET;
    const key = `Invoice/${uuidv4()}-${file.originalname}`;

    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is not defined in environment variables');
    }

    const uploadResult = await this.s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      documentUrl: uploadResult.Location,
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
    await this.invoiceRepository.delete(id);
  }

  async updateStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = status;
    return this.invoiceRepository.save(invoice);
  }
}
