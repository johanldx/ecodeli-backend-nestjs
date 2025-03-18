import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend'; // ✅ Modifier cet import

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in .env');
    }

    this.resend = new Resend(apiKey); // ✅ Utilisation correcte
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') ?? ''; // ✅ Correction du type
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
