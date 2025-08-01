import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Conversation, AdTypes, ConversationStatus } from './entities/conversation.entity';
import { ReleaseCartAd } from 'src/release-cart-ads/entities/release-cart-ad.entity';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ShoppingAd } from 'src/shopping-ads/entities/shopping-ads.entity';
import { DeliveryAd } from 'src/delivery-ads/entities/delivery-ads.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { PersonalServiceAd } from 'src/personal-services-ads/personal-service-ad.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>,

    @InjectRepository(ShoppingAd)
    private readonly shoppingRepo: Repository<ShoppingAd>,

    @InjectRepository(DeliveryAd)
    private readonly deliveryRepo: Repository<DeliveryAd>,

    @InjectRepository(ReleaseCartAd)
    private readonly releaseRepo: Repository<ReleaseCartAd>,

    @InjectRepository(PersonalServiceAd)
    private readonly personalServiceRepo: Repository<PersonalServiceAd>,
  ) {}

  private async isAdOwner(
    conv: Conversation,
    userId: number,
  ): Promise<boolean> {
    switch (conv.adType) {
      case AdTypes.ShoppingAds:
        return !!(await this.shoppingRepo.findOne({
          where: { id: conv.adId, postedBy: { id: userId } },
        }));
      case AdTypes.DeliverySteps:
        return !!(await this.deliveryRepo.findOne({
          where: { id: conv.adId, postedBy: { id: userId } },
        }));
      case AdTypes.ReleaseCartAds:
        return !!(await this.releaseRepo.findOne({
          where: { id: conv.adId, postedBy: { id: userId } },
        }));
      default:
        return false;
    }
  }

  private async conversationExists(
    adType: AdTypes,
    adId: number,
    userId: number,
  ): Promise<boolean> {
    const existingConversation = await this.repo.findOne({
      where: {
        adType,
        adId,
        userFrom: { id: userId },
      },
    });
    return !!existingConversation;
  }

  private async conversationPendingExists(
    adType: AdTypes,
    adId: number,
    userId: number,
  ): Promise<boolean> {
    const existingConversation = await this.repo.findOne({
      where: {
        adType,
        adId,
        userFrom: { id: userId },
        status: ConversationStatus.Pending,
      },
    });
    return !!existingConversation;
  }

  async create(dto: CreateConversationDto): Promise<Conversation> {
    if (dto.adType !== AdTypes.ServiceProvisions) {
      const exists = await this.conversationExists(dto.adType, dto.adId, dto.userFrom);
      if (exists) {
        throw new ForbiddenException('Une conversation existe déjà pour cette annonce');
      }
    } else {
      const pendingExists = await this.conversationPendingExists(dto.adType, dto.adId, dto.userFrom);
      if (pendingExists) {
        throw new ForbiddenException('Une conversation en attente existe déjà pour cette annonce');
      }
    }

    const conv = this.repo.create({
      ...dto,
      userFrom: { id: dto.userFrom },
      providerSchedule: dto.providerScheduleId
        ? { id: dto.providerScheduleId }
        : undefined,
    });
    return this.repo.save(conv);
  }

  async findAll(userId: number): Promise<Conversation[]> {
    return (
      this.repo
        .createQueryBuilder('conv')
        .leftJoinAndSelect('conv.userFrom', 'userFrom')
        .leftJoinAndSelect('conv.providerSchedule', 'providerSchedule')
        .where('userFrom.id = :userId', { userId })

        // ServiceProvisions → colonne `posted_by` dans personal_service_ads
        .orWhere(
          new Brackets((qb) =>
            qb
              .where('conv.ad_type = :service', { service: AdTypes.ServiceProvisions })
              .andWhere(
                `EXISTS(
            SELECT 1 FROM personal_service_ads ad
            WHERE ad.id = conv.ad_id
              AND ad.posted_by = :userId
          )`,
                { userId },
              ),
          ),
        )

        // ShoppingAds → colonne `posted_by`
        .orWhere(
          new Brackets((qb) =>
            qb
              .where('conv.ad_type = :shop', { shop: AdTypes.ShoppingAds })
              .andWhere(
                `EXISTS(
            SELECT 1 FROM shopping_ads ad
            WHERE ad.id = conv.ad_id
              AND ad.posted_by = :userId
          )`,
                { userId },
              ),
          ),
        )

        // DeliverySteps → colonne `postedById`
        .orWhere(
          new Brackets((qb) =>
            qb
              .where('conv.ad_type = :del', { del: AdTypes.DeliverySteps })
              .andWhere(
                `EXISTS (
                  SELECT 1
                  FROM delivery_steps step
                  JOIN delivery_ads ad ON ad.id = step.delivery_ad_id
                  WHERE step.id = conv.ad_id
                    AND ad.postedById = :userId
                )`,
                { userId },
              ),
          ),
        )

        // ReleaseCartAds → colonne `postedById`
        .orWhere(
          new Brackets((qb) =>
            qb
              .where('conv.ad_type = :rel', { rel: AdTypes.ReleaseCartAds })
              .andWhere(
                `EXISTS(
            SELECT 1 FROM release_cart_ads ad
            WHERE ad.id = conv.ad_id
              AND ad.posted_by = :userId
          )`,
                { userId },
              ),
          ),
        )

        .getMany()
    );
  }

  async findOne(id: number, userId: number): Promise<Conversation> {
    const conv = await this.repo.findOne({
      where: { id },
      relations: ['userFrom'],
    });
    if (!conv) throw new NotFoundException('Conversation introuvable');

    const iAmSender = conv.userFrom.id === userId;
    const iOwnAd = await this.isAdOwner(conv, userId);
    if (!iAmSender && !iOwnAd) throw new ForbiddenException();

    return conv;
  }

  async update(
    id: number,
    dto: UpdateConversationDto,
    userId: number,
  ): Promise<Conversation> {
    const conv = await this.findOne(id, userId);
    Object.assign(conv, dto);

    if (dto.providerScheduleId !== undefined) {
      conv.providerScheduleId = dto.providerScheduleId;
    }

    return this.repo.save(conv);
  }

  async remove(id: number, userId: number): Promise<void> {
    const conv = await this.findOne(id, userId);
    await this.repo.delete(conv.id);
  }
}
