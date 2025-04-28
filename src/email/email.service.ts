import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in .env');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') ?? '';
  }

  async sendEmail(to: string, subject: string, title: string, content: string) {
    const html = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Email Template</title>
        <style type="text/css">
          /* Importation de la police depuis Google Fonts */
          @import url('https://fonts.googleapis.com/css?family=Open+Sans');
          body, table, td, p, a, li, blockquote {
            font-family: 'Open Sans', Arial, sans-serif;
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background-color: #FEFCF3;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FEFCF3;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <img src="${this.configService.get<string>('FRONDEND_URL')}/images/logo/ecodeli-light.png" alt="EcoDeli" style="display: block; max-width: 150px; height: auto;" border="0">
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" align="center" style="background-color: #FEFCF3; color: #0C392C;">
                <tr>
                  <td style="padding: 20px; color: #0C392C;">
                    <h1 style="color: #0C392C; margin-top: 0;">${title}</h1>
                    <p>Bonjour, </p>
                    ${content}
                    <p>
                      Merci,<br>
                      L'équipe EcoDeli
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px; font-size: 12px; color: #0C392C;">
              © 2025 EcoDeli. Tous droits réservés.
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

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
