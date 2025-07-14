import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/user.entity';
import { AuthService } from './auth/auth.service';
import { EmailService } from './email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    try {
      const userCount = await this.userRepository.count();
      
      if (userCount === 0) {
        console.log('Aucun utilisateur trouvé dans la base de données. Création du compte admin par défaut...');
        
        const password = this.generateComplexPassword();
        
        const adminUser = this.userRepository.create({
          first_name: 'Admin',
          last_name: 'EcoDeli',
          email: 'ecodeli.fr@gmail.com',
          password: await this.authService.hashPassword(password),
          administrator: true,
          active: true,
        });

        await this.userRepository.save(adminUser);
        
        await this.sendAdminCredentialsEmail(password);
        
        console.log('Compte admin par défaut créé avec succès !');
        console.log('Email: ecodeli.fr@gmail.com');
        console.log('Mot de passe temporaire envoyé par email');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du compte admin par défaut:', error);
    }
  }

  private generateComplexPassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
    password += '0123456789'[crypto.randomInt(10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[crypto.randomInt(32)];
    
    for (let i = 4; i < length; i++) {
      password += charset[crypto.randomInt(charset.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private async sendAdminCredentialsEmail(password: string) {
    const loginUrl = `${this.configService.get<string>('FRONDEND_URL')}/auth/login`;
    const changePasswordUrl = `${this.configService.get<string>('FRONDEND_URL')}/auth/change-password`;
    
    const emailContent = `
      <p>Un compte administrateur par défaut a été créé pour votre application EcoDeli.</p>
      
      <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0C392C;">Identifiants de connexion :</h3>
        <p><strong>Email :</strong> ecodeli.fr@gmail.com</p>
        <p><strong>Mot de passe temporaire :</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
      </div>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #856404;">⚠️ IMPORTANT : Sécurité</h4>
        <p>Ce mot de passe est temporaire et a été généré automatiquement. Pour des raisons de sécurité, nous vous <strong>recommandons fortement</strong> de le changer dès votre première connexion.</p>
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${loginUrl}" style="display: inline-block; background-color: #0C392C; color: #FEFCF3; text-decoration: none; padding: 12px 25px; border-radius: 1000px; margin: 0 10px;">
          Se connecter
        </a>
        <a href="${changePasswordUrl}" style="display: inline-block; background-color: #28a745; color: #FEFCF3; text-decoration: none; padding: 12px 25px; border-radius: 1000px; margin: 0 10px;">
          Changer le mot de passe
        </a>
      </div>
      
      <p>Une fois connecté, vous pourrez accéder au panneau d'administration et gérer votre application EcoDeli.</p>
      
      <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
    `;

    await this.emailService.sendEmail(
      'ecodeli.fr@gmail.com',
      'Compte administrateur EcoDeli créé - Identifiants de connexion',
      'Compte administrateur EcoDeli créé',
      emailContent,
    );
  }

  getHello(): string {
    return 'API EcoDeli';
  }
}
