import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly invoicesService: InvoicesService) {}

  onModuleInit() {
    // Se déclenche à minuit le 1er jour de chaque mois
    cron.schedule('0 0 1 * *', () => {
      this.handleMonthlyInvoiceGeneration();
    });
  }

  async handleMonthlyInvoiceGeneration() {
    this.logger.log('Starting monthly invoice generation cron job...');
    const now = new Date();
    // On génère pour le mois précédent, car le mois en cours n'est pas terminé
    const targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    this.logger.log(`Targeting period: ${year}-${month}`);

    try {
      const providerIds = await this.invoicesService.getProvidersWithPayments(year, month);
      this.logger.log(`Found ${providerIds.length} providers to generate invoices for.`);
      
      for (const providerId of providerIds) {
        try {
          await this.invoicesService.generateMonthlyInvoiceForProvider(providerId, year, month);
          this.logger.log(`Successfully generated invoice for provider #${providerId}`);
        } catch (error) {
          this.logger.error(`Failed to generate invoice for provider #${providerId}: ${error.message}`);
        }
      }
      this.logger.log('Monthly invoice generation cron job finished.');
    } catch (error) {
      this.logger.error('An unexpected error occurred during the monthly invoice cron job.', error.stack);
    }
  }
} 