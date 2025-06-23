import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Subscription } from './entities/subscriptions.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { StripeService } from '../stripe/stripe.service';
import { User } from '../users/user.entity';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly stripeService: StripeService,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultSubscriptions();
  }

  private async initializeDefaultSubscriptions() {
    const count = await this.subscriptionRepo.count();
    
    if (count === 0) {
      console.log('Initialisation des abonnements par défaut...');
      
      const defaultSubscriptions = [
        {
          name: 'Free',
          description: 'Plan gratuit avec fonctionnalités de base',
          price: 0,
          stripe_id: 'free_plan',
        },
        {
          name: 'Starter',
          description: 'Plan starter avec fonctionnalités avancées',
          price: 9.90,
          stripe_id: 'starter_plan',
        },
        {
          name: 'Premium',
          description: 'Plan premium avec toutes les fonctionnalités',
          price: 19.99,
          stripe_id: 'premium_plan',
        },
      ];

      for (const subData of defaultSubscriptions) {
        let stripePriceId = '';

        if (subData.price === 0) {
          // Pour le plan gratuit, on utilise un ID spécial
          stripePriceId = 'free_plan';
        } else {
          try {
            // Créer le produit Stripe
            const product = await this.stripeService.createProduct({
              name: subData.name,
              description: subData.description,
            });

            // Créer le prix récurrent mensuel
            const price = await this.stripeService.createPrice({
              product: product.id,
              unit_amount: Math.round(subData.price * 100),
              currency: 'eur',
              recurring: { interval: 'month' },
            });

            stripePriceId = price.id;
            console.log(`Produit et prix Stripe créés pour ${subData.name}:`, { productId: product.id, priceId: price.id });
          } catch (error) {
            console.error(`Erreur lors de la création du produit Stripe pour ${subData.name}:`, error);
            // En cas d'erreur, on utilise un ID par défaut
            stripePriceId = `${subData.name.toLowerCase()}_price`;
          }
        }

        // Créer l'abonnement en base de données
        const subscription = this.subscriptionRepo.create({
          ...subData,
          stripe_id: stripePriceId,
        });
        
        await this.subscriptionRepo.save(subscription);
        console.log(`Abonnement ${subData.name} créé avec l'ID Stripe: ${stripePriceId}`);
      }

      // Assigner le plan Free par défaut à tous les utilisateurs existants
      const freePlan = await this.subscriptionRepo.findOne({
        where: { name: 'Free' }
      });

      if (freePlan) {
        await this.userRepo.update(
          { current_subscription_id: IsNull() },
          { 
            current_subscription_id: freePlan.id,
            subscription_end_date: null // Le plan Free n'a pas de date de fin
          }
        );
        console.log('Plan Free assigné par défaut à tous les utilisateurs existants');
      }
    }
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    // Seuls les admins peuvent créer des abonnements
    throw new ForbiddenException('La création d\'abonnements n\'est pas autorisée. Utilisez l\'initialisation automatique.');
  }

  async findAll(query: any): Promise<Subscription[]> {
    const qb = this.subscriptionRepo.createQueryBuilder('subscription');

    if (query.name) {
      qb.andWhere('subscription.name LIKE :name', { name: `%${query.name}%` });
    }

    if (query.price_min) {
      qb.andWhere('subscription.price >= :price_min', {
        price_min: query.price_min,
      });
    }

    if (query.price_max) {
      qb.andWhere('subscription.price <= :price_max', {
        price_max: query.price_max,
      });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOneBy({ id });
    if (!subscription) throw new NotFoundException('Abonnement introuvable');
    return subscription;
  }

  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    // Mettre à jour le produit Stripe si le nom ou la description change
    if (updateSubscriptionDto.name || updateSubscriptionDto.description) {
      try {
        await this.stripeService.updateProduct(subscription.stripe_id, {
          name: updateSubscriptionDto.name || subscription.name,
          description: updateSubscriptionDto.description || subscription.description,
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du produit Stripe:', error);
      }
    }

    // Mettre à jour le prix Stripe si le prix change
    if (updateSubscriptionDto.price !== undefined && updateSubscriptionDto.price !== subscription.price) {
      try {
        const newPrice = await this.stripeService.createPrice({
          product: subscription.stripe_id,
          unit_amount: Math.round(updateSubscriptionDto.price * 100),
          currency: 'eur',
          recurring: {
            interval: 'month',
          },
        });
        updateSubscriptionDto.stripe_id = newPrice.id;
      } catch (error) {
        console.error('Erreur lors de la création du nouveau prix Stripe:', error);
      }
    }

    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepo.save(subscription);
  }

  async remove(id: number): Promise<void> {
    // Seuls les admins peuvent supprimer des abonnements
    throw new ForbiddenException('La suppression d\'abonnements n\'est pas autorisée.');
  }

  async getCurrentUserSubscription(userId: number): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['currentSubscription'],
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Si l'utilisateur n'a pas d'abonnement, lui assigner le plan Free par défaut
    if (!user.currentSubscription) {
      await this.assignDefaultSubscription(userId);
      
      // Recharger l'utilisateur avec le nouvel abonnement
      const updatedUser = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['currentSubscription'],
      });

      if (!updatedUser || !updatedUser.currentSubscription) {
        throw new NotFoundException('Impossible d\'assigner l\'abonnement par défaut');
      }

      return {
        subscription: updatedUser.currentSubscription,
        end_date: updatedUser.subscription_end_date,
        is_active: true, // Le plan Free est toujours actif
      };
    }

    const is_active =
      user.currentSubscription.name === 'Free' ||
      (user.subscription_end_date &&
        new Date(user.subscription_end_date) > new Date());

    return {
      subscription: user.currentSubscription,
      end_date: user.subscription_end_date,
      is_active,
    };
  }

  async createCustomerPortalSession(userId: number, returnUrl: string): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (!user.stripe_id) {
      await this.stripeService.createStripeCustomer(userId);
    }

    const session = await this.stripeService.createCustomerPortalSession(
      user.stripe_id!,
      returnUrl
    );

    return { url: session.url };
  }

  async assignDefaultSubscription(userId: number): Promise<void> {
    const freePlan = await this.subscriptionRepo.findOne({
      where: { name: 'Free' }
    });

    if (freePlan) {
      await this.userRepo.update(
        { id: userId },
        { 
          current_subscription_id: freePlan.id,
          subscription_end_date: null // Le plan Free n'a pas de date de fin
        }
      );
    }
  }

  async resetStripeSubscriptions(): Promise<void> {
    // Supprimer tous les abonnements existants
    await this.subscriptionRepo.clear();
    
    // Réinitialiser les utilisateurs
    await this.userRepo.update(
      {},
      { 
        current_subscription_id: null,
        subscription_stripe_id: null,
        subscription_end_date: null
      }
    );
    
    // Réinitialiser les abonnements
    await this.initializeDefaultSubscriptions();
  }

  async getStripeStatus(): Promise<any> {
    try {
      const dbSubscriptions = await this.subscriptionRepo.find();
      const stripeProducts = await this.stripeService.listProducts();
      const stripePrices = await this.stripeService.listPrices();

      return {
        database: {
          subscriptions: dbSubscriptions.map(sub => ({
            id: sub.id,
            name: sub.name,
            price: sub.price,
            stripe_id: sub.stripe_id
          }))
        },
        stripe: {
          products: stripeProducts.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description
          })),
          prices: stripePrices.map(p => ({
            id: p.id,
            product: p.product,
            unit_amount: p.unit_amount,
            currency: p.currency,
            recurring: p.recurring
          }))
        }
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut Stripe:', error);
      throw error;
    }
  }
}
