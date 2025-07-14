import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ProviderRatingResponseDto } from './dto/provider-rating-response.dto';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    private readonly emailService: EmailService,
  ) {}

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async createRatingEntry(
    providerId: number,
    raterId: number,
    conversationId: number,
  ): Promise<Rating> {
    console.log('[Ratings] Création entrée de rating:', { providerId, raterId, conversationId });
    
    const token = this.generateToken();
    console.log('[Ratings] Token généré:', token);
    
    const rating = this.ratingRepo.create({
      providerId,
      raterId,
      conversationId,
      token,
      isUsed: false,
    });

    const savedRating = await this.ratingRepo.save(rating);
    console.log('[Ratings] Entrée de rating sauvegardée avec ID:', savedRating.id);
    
    return savedRating;
  }

  async submitRating(dto: CreateRatingDto): Promise<Rating> {
    const ratingEntry = await this.ratingRepo.findOne({
      where: { token: dto.token, isUsed: false },
      relations: ['provider', 'rater', 'conversation'],
    });

    if (!ratingEntry) {
      throw new NotFoundException('Token invalide ou déjà utilisé');
    }

    ratingEntry.rating = dto.rating;
    ratingEntry.comment = dto.comment || null;
    ratingEntry.isUsed = true;

    const savedRating = await this.ratingRepo.save(ratingEntry);

    await this.sendProviderNotificationEmail(savedRating);

    return savedRating;
  }

  private async sendProviderNotificationEmail(rating: Rating): Promise<void> {
    try {
      if (!rating.provider?.email) {
        console.error('[Ratings] Impossible d\'envoyer l\'email: email du prestataire manquant');
        return;
      }

      const providerEmail = rating.provider.email;
      const serviceTitle = rating.conversation?.adType === 'ServiceProvisions' ? 'Votre service' : 'Votre annonce';
      
      const subject = 'Nouvelle évaluation reçue - EcoDeli';
      const title = 'Vous avez reçu une nouvelle évaluation !';
      
      let content = `
        <p>Vous avez reçu une nouvelle évaluation pour ${serviceTitle}.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0C392C;">Détails de l'évaluation :</h3>
          <p><strong>Note :</strong> ${rating.rating}/5 étoiles</p>
      `;

      if (rating.comment) {
        content += `<p><strong>Commentaire :</strong> "${rating.comment}"</p>`;
      } else {
        content += `<p><strong>Commentaire :</strong> Aucun commentaire fourni</p>`;
      }

      content += `
          <p><strong>Date de l'évaluation :</strong> ${rating.createdAt.toLocaleDateString('fr-FR')}</p>
        </div>
        <p>Cette évaluation est maintenant visible dans votre espace prestataire et contribue à votre note moyenne globale.</p>
      `;

      if (rating.rating && rating.rating < 2) {
        content += `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Note importante :</strong> Avec une note en dessous de 2 étoiles, vous risquez un appel de nos équipes et la suspension de votre compte prestataire. Nous vous encourageons à contacter notre support si vous avez des questions ou des préoccupations.
            </p>
          </div>
        `;
      }

      content += `
        <p>Merci de votre engagement pour maintenir la qualité de nos services.</p>
        <p>
          Cordialement,<br>
          L'équipe EcoDeli
        </p>
      `;

      await this.emailService.sendEmail(providerEmail, subject, title, content);
      console.log('[Ratings] Email de notification envoyé au prestataire:', providerEmail);
      
    } catch (error) {
      console.error('[Ratings] Erreur lors de l\'envoi de l\'email de notification:', error);
    }
  }

  async getProviderRatingStats(providerId: number): Promise<ProviderRatingResponseDto> {
    const ratings = await this.ratingRepo.find({
      where: { providerId, isUsed: true },
    });

    const validRatings = ratings.filter(r => r.rating !== null);

    if (validRatings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRatings = validRatings.length;
    const averageRating = validRatings.reduce((sum, r) => sum + (r.rating as number), 0) / totalRatings;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    validRatings.forEach(r => {
      distribution[r.rating as number]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution: distribution,
    };
  }

  async getRatingByToken(token: string): Promise<Rating> {
    const rating = await this.ratingRepo.findOne({
      where: { token, isUsed: false },
      relations: ['provider', 'rater', 'conversation'],
    });

    if (!rating) {
      throw new NotFoundException('Token invalide ou déjà utilisé');
    }

    return rating;
  }

  async getAllRatingsForAdmin(): Promise<any[]> {
    const ratings = await this.ratingRepo.find({
      where: { isUsed: true },
      relations: ['provider', 'rater', 'conversation'],
      order: { createdAt: 'DESC' },
    });

    const providerStats = new Map();
    
    ratings.forEach(rating => {
      if (!rating.provider || rating.rating === null) return;
      
      const providerId = rating.provider.id;
      if (!providerStats.has(providerId)) {
        providerStats.set(providerId, {
          provider: rating.provider,
          ratings: [],
          totalRating: 0,
          count: 0,
        });
      }
      
      const stats = providerStats.get(providerId);
      stats.ratings.push({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        rater: rating.rater,
        conversation: rating.conversation,
        createdAt: rating.createdAt,
      });
      stats.totalRating += rating.rating;
      stats.count++;
    });

    const result = Array.from(providerStats.values()).map(stats => ({
      provider: {
        id: stats.provider.id,
        firstName: stats.provider.first_name,
        lastName: stats.provider.last_name,
        email: stats.provider.email,
      },
      averageRating: Math.round((stats.totalRating / stats.count) * 10) / 10,
      totalRatings: stats.count,
      ratings: stats.ratings,
    }));

    return result.sort((a, b) => a.averageRating - b.averageRating);
  }
} 