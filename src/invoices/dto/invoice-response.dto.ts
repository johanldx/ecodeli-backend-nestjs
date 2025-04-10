import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceResponseDto {
  id: number;
  providerId: number;
  documentUrl: string;
  status: InvoiceStatus;
  createdAt: Date;
  editedAt: Date;
}
