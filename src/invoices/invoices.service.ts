import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between, In } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

import { Invoice, InvoiceStatus, InvoiceLine } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { StorageService } from '../storage/storage.service';
import { AdPayment } from '../ad-payments/entities/ad-payment.entity';
import { PaymentStatus } from '../ad-payments/entities/payment.enums';
import { Provider } from '../providers/provider.entity';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { WalletTransactionTypes } from '../wallet-transactions/entities/wallet-transaction-types.enum';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceLine)
    private invoiceLineRepository: Repository<InvoiceLine>,
    @InjectRepository(AdPayment)
    private adPaymentRepository: Repository<AdPayment>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private storageService: StorageService,
    private emailService: EmailService,
    private walletsService: WalletTransactionsService,
  ) {}

  async create(
    createInvoiceDto: CreateInvoiceDto,
    file: Express.Multer.File,
  ): Promise<Invoice> {
    const documentUrl = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      'providers-invoices',
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

  findAllByProvider(providerId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({ where: { providerId } });
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

  /**
   * Génère une facture PDF pour un provider, la stocke et la sauvegarde.
   */
  async generateMonthlyInvoiceForProvider(providerId: number, year: number, month: number): Promise<Invoice> {
    this.logger.log(`[START] Invoice generation for provider #${providerId} for ${year}-${month}`);

    const provider = await this.providerRepository.findOne({ where: { id: providerId }, relations: ['user'] });
    if (!provider || !provider.user) {
      throw new NotFoundException(`Provider #${providerId} or associated user not found.`);
    }

    const lastInvoice = await this.invoiceRepository.findOne({ where: { providerId }, order: { createdAt: 'DESC' } });
    const lastDate = lastInvoice?.createdAt;
    this.logger.log(`Last invoice found: ${lastInvoice ? `ID ${lastInvoice.id} on ${lastDate}` : 'None'}.`);

    const payments = await this.adPaymentRepository.find({
      where: {
        user: { id: provider.user.id },
        status: PaymentStatus.COMPLETED,
        ...(lastDate && { created_at: MoreThan(lastDate) }),
      },
      order: { created_at: 'ASC' },
    });

    if (payments.length === 0) {
      this.logger.warn(`No new completed payments for provider #${providerId}. [ABORTING]`);
      throw new ConflictException('Aucun nouveau paiement à facturer pour ce prestataire.');
    }
    this.logger.log(`Found ${payments.length} payments to process.`);

    const invoiceEntity = this.invoiceRepository.create({
      providerId,
      userId: provider.user.id,
      documentUrl: '',
      status: InvoiceStatus.CREATED,
    });
    await this.invoiceRepository.save(invoiceEntity);
    this.logger.log(`Invoice #${invoiceEntity.id} created.`);

    const lines = await Promise.all(
      payments.map(p => {
        const line = this.invoiceLineRepository.create({
          invoiceId: invoiceEntity.id,
          adPaymentId: p.id,
          adType: p.payment_type,
          adReference: p.reference_id.toString(),
          amount: p.amount,
          description: `Prestation du ${p.created_at.toLocaleDateString('fr-FR')}`,
        });
        return this.invoiceLineRepository.save(line);
      }),
    );
    invoiceEntity.lines = lines;
    this.logger.log(`Created ${lines.length} invoice lines.`);

    const pdfBuffer = await this.createInvoicePDF(invoiceEntity, provider, payments);
    this.logger.log(`PDF buffer created. Size: ${pdfBuffer.byteLength} bytes.`);

    const fileName = `facture-ecodeli-${invoiceEntity.id}-${year}-${month}.pdf`;
    const folder = `providers-invoices/${providerId}/${year}-${month.toString().padStart(2, '0')}`;
    const documentUrl = await this.storageService.uploadFile(pdfBuffer, fileName, folder);
    this.logger.log(`File uploaded to S3: ${documentUrl}`);

    invoiceEntity.documentUrl = documentUrl;
    await this.invoiceRepository.save(invoiceEntity);
    this.logger.log(`[SUCCESS] Invoice #${invoiceEntity.id} updated with S3 URL.`);

    const totalAmount = invoiceEntity.lines.reduce((sum, line) => sum + line.amount, 0);
    const formattedAmount = this.formatCurrency(totalAmount);

    // Retirer l'argent du wallet du prestataire
    try {
      await this.walletsService.create(
        {
          amount: totalAmount,
          type: WalletTransactionTypes.WITHDRAWAL,
          is_available: true
        },
        provider.user
      );
      this.logger.log(`Successfully withdrew ${formattedAmount} from provider #${providerId} wallet for invoice #${invoiceEntity.id}`);
    } catch (error) {
      this.logger.error(`Failed to withdraw money from provider #${providerId} wallet for invoice #${invoiceEntity.id}`, error);
      throw new Error(`Impossible de retirer l'argent du wallet du prestataire: ${error.message}`);
    }

    try {
      const providerEmail = provider.user.email;
      const subject = 'Votre relevé de paiement Ecodeli est disponible';
      const title = 'Nouveau relevé de paiement';
      const content = `
        <p>Votre relevé de paiement pour la période est désormais disponible dans votre espace personnel.</p>
        <p>Le montant total versé pour cette période est de <strong>${formattedAmount}</strong>.</p>
        <p>Vous pouvez consulter le détail et télécharger votre document en cliquant sur le bouton ci-dessous :</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${invoiceEntity.documentUrl}" style="background-color: #0C392C; color: #FEFCF3; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Consulter mon relevé
          </a>
        </p>
        <p>Vous pouvez également retrouver ce document dans votre espace prestataire.</p>
      `;

      await this.emailService.sendEmail(providerEmail, subject, title, content);
      this.logger.log(`Sent payment statement email to ${providerEmail} for invoice #${invoiceEntity.id}.`);
    } catch (error) {
      this.logger.error(`Failed to send email for invoice #${invoiceEntity.id} to ${provider.user.email}`, error);
    }
    
    return invoiceEntity;
  }

  private async createInvoicePDF(invoice: Invoice, provider: Provider, payments: AdPayment[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        this.generateHeader(doc);
        this.generateCustomerInformation(doc, invoice, provider);
        this.generateInvoiceTable(doc, invoice, payments);
        this.generateFooter(doc);

        doc.end();
      } catch (error) {
        this.logger.error('Error during PDF generation', error.stack);
        reject(error);
      }
    });
  }

  private generateHeader(doc: any) {
    const logoPath = path.join(process.cwd(), 'src/assets/ecodeli.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    } else {
      this.logger.warn(`Logo not found at path: ${logoPath}`);
      doc.fontSize(20).text('Ecodeli', 50, 57);
    }
    
    doc
      .fontSize(10)
      .text('Ecodeli SAS', 200, 50, { align: 'right' })
      .text('110 rue de Flandre', 200, 65, { align: 'right' })
      .text('75019 Paris, France', 200, 80, { align: 'right' })
      .moveDown();
  }

  private generateCustomerInformation(doc: any, invoice: Invoice, provider: Provider) {
    doc.fillColor('#444444').fontSize(20).text('Relevé de Paiement', 50, 160);
    this.generateHr(doc, 185);

    const customerInformationTop = 200;
    const user = provider.user;

    doc
      .fontSize(10)
      .text('Numéro de facture :', 50, customerInformationTop)
      .font('Helvetica-Bold')
      .text(invoice.id.toString(), 150, customerInformationTop)
      .font('Helvetica')
      .text("Date d'émission :", 50, customerInformationTop + 15)
      .text(new Date().toLocaleDateString('fr-FR'), 150, customerInformationTop + 15)
      .moveDown();
      
    doc
      .font('Helvetica-Bold')
      .text('Pour le prestataire :', 300, customerInformationTop)
      .font('Helvetica')
      .text(provider.name || `${user.first_name} ${user.last_name}`, 300, customerInformationTop + 15)
      .text('Adresse non renseignée', 300, customerInformationTop + 30)
      .text(user.email, 300, customerInformationTop + 45)
      .moveDown(2);

    this.generateHr(doc, 272);
  }

  private generateInvoiceTable(doc: any, invoice: Invoice, payments: AdPayment[]) {
    let i;
    const invoiceTableTop = 330;
    doc.font('Helvetica-Bold');
    this.generateTableRow(doc, invoiceTableTop, 'Type de prestation', 'Description', 'Référence', 'Date', 'Montant versé');
    this.generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    let position = 0;
    let totalAmount = 0;

    for (i = 0; i < invoice.lines.length; i++) {
      const line = invoice.lines[i];
      const payment = payments[i];
      position = invoiceTableTop + (i + 1) * 30;
      totalAmount += line.amount;

      this.generateTableRow(
        doc,
        position,
        line.adType,
        line.description,
        line.adReference,
        payment.created_at.toLocaleDateString('fr-FR'),
        this.formatCurrency(line.amount),
      );
      this.generateHr(doc, position + 20);
    }
    
    const subtotalPosition = position + 30;
    this.generateTableRow(doc, subtotalPosition, '', '', '', 'Total des revenus', this.formatCurrency(totalAmount));

    const vatPosition = subtotalPosition + 20;
    // La TVA est gérée par le prestataire, Ecodeli verse un montant brut.
    this.generateTableRow(doc, vatPosition, '', '', '', 'TVA', 'N/A');

    const totalPosition = vatPosition + 25;
    doc.font('Helvetica-Bold');
    this.generateTableRow(doc, totalPosition, '', '', '', 'Montant total versé', this.formatCurrency(totalAmount));
    doc.font('Helvetica');
  }

  private generateFooter(doc: any) {
    doc.fontSize(8).text(
        'Ce document est un récapitulatif des paiements effectués par Ecodeli SAS au prestataire mentionné. ' +
        'Le prestataire est responsable de la déclaration de ces revenus et du paiement des cotisations sociales et fiscales applicables.',
        50,
        750,
        { align: 'center', width: 500 },
      );
  }
  
  private generateTableRow(
    doc: any,
    y: number,
    c1: string,
    c2: string,
    c3: string,
    c4: string,
    c5: string,
  ) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 150, y)
      .text(c3, 280, y, { width: 90 })
      .text(c4, 370, y, { width: 90 })
      .text(c5, 0, y, { align: 'right' });
  }

  private generateHr(doc: any, y: number) {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
  }

  private formatCurrency(cents: number) {
    return (cents).toFixed(2) + ' €';
  }

  /**
   * Retourne la liste des providerId ayant au moins un paiement validé sur la période
   */
  async getProvidersWithPayments(year: number, month: number): Promise<number[]> {
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59);

    // On récupère les IDs des utilisateurs ayant des paiements "completed" sur la période
    const userWithPayments = await this.adPaymentRepository.find({
      select: ['user'], // On ne sélectionne que l'utilisateur
      where: {
        status: PaymentStatus.COMPLETED,
        created_at: Between(start, end),
      },
      relations: ['user'],
    });

    const userIds = Array.from(new Set(userWithPayments.map(p => p.user?.id).filter(Boolean)));

    if (userIds.length === 0) {
      return [];
    }
    
    // On trouve les providers qui correspondent à ces userIds
    const providers = await this.providerRepository.find({
      where: {
        user: { id: In(userIds) },
      },
      select: ['id'], // On ne veut que l'ID du provider
    });
    
    const providerIds = providers.map(p => p.id);
    this.logger.log(`Found ${providerIds.length} providers linked to users with payments: [${providerIds.join(', ')}]`);

    return providerIds;
  }
}
