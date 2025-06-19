import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ProviderRatingResponseDto } from './dto/provider-rating-response.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  /**
   * Génère un token unique pour l'email de rating
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Crée une entrée de rating (appelée quand une conversation est complétée)
   */
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

  /**
   * Soumet une note via le token
   */
  async submitRating(dto: CreateRatingDto): Promise<Rating> {
    const ratingEntry = await this.ratingRepo.findOne({
      where: { token: dto.token, isUsed: false },
      relations: ['provider', 'rater', 'conversation'],
    });

    if (!ratingEntry) {
      throw new NotFoundException('Token invalide ou déjà utilisé');
    }

    // Marquer comme utilisé et sauvegarder la note
    ratingEntry.rating = dto.rating;
    ratingEntry.comment = dto.comment || null;
    ratingEntry.isUsed = true;

    return this.ratingRepo.save(ratingEntry);
  }

  /**
   * Récupère les statistiques de rating d'un prestataire
   */
  async getProviderRatingStats(providerId: number): Promise<ProviderRatingResponseDto> {
    const ratings = await this.ratingRepo.find({
      where: { providerId, isUsed: true },
    });

    // Filtrer les ratings qui ont une note (pas null)
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
      averageRating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
      totalRatings,
      ratingDistribution: distribution,
    };
  }

  /**
   * Récupère une entrée de rating par token (pour affichage de la page de rating)
   */
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
} 