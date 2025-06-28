import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalServiceAd, AdStatus } from './personal-service-ad.entity';
import { CreatePersonalServiceAdDto } from './dto/create-personal-service-ad.dto';
import { UpdatePersonalServiceAdDto } from './dto/update-personal-service-ad.dto';
import { StorageService } from '../storage/storage.service';
import { PersonalServiceAdDto } from './dto/personal-service-ad.dto';
import { PersonalServiceType } from 'src/personal-service-types/personal-service-type.entity';
import { Conversation, AdTypes } from '../conversations/entities/conversation.entity';

@Injectable()
export class PersonalServicesAdsService {
  constructor(
    @InjectRepository(PersonalServiceAd)
    private readonly adRepo: Repository<PersonalServiceAd>,
    @InjectRepository(PersonalServiceType)
    private readonly typeRepo: Repository<PersonalServiceType>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly storageService: StorageService,
  ) {}

  private toDto(ad: PersonalServiceAd): PersonalServiceAdDto {
    return {
      id: ad.id,
      postedById: ad.postedBy?.id ?? null,
      title: ad.title ?? null,
      description: ad.description ?? null,
      imageUrls: ad.imageUrls ?? null,
      status: ad.status ?? null,
      typeId: ad.type?.id ?? null,
      createdAt: ad.createdAt,
      editedAt: ad.editedAt,
    };
  }

  async create(
    userId: number,
    dto: CreatePersonalServiceAdDto,
    images: Express.Multer.File[],
  ): Promise<PersonalServiceAdDto> {
    if (!images || images.length === 0) {
      throw new Error('At least one image is required');
    }

    const type = await this.typeRepo.findOne({ where: { id: dto.typeId } });
    if (!type) throw new NotFoundException(`Type ${dto.typeId} not found`);

    const urls = await Promise.all(
      images.map((file) =>
        this.storageService.uploadFile(
          file.buffer,
          file.originalname,
          'personal-service-ads',
        ),
      ),
    );

    const adEntity = this.adRepo.create({
      title: dto.title,
      description: dto.description,
      postedBy: { id: userId } as any,
      type, // 👈 ajoute l'objet complet ici
      imageUrls: urls,
      status: AdStatus.PENDING,
    });

    const saved = await this.adRepo.save(adEntity);
    return this.toDto(saved);
  }

  async findAll(): Promise<PersonalServiceAdDto[]> {
    const ads = await this.adRepo.find();
    return ads.map((ad) => this.toDto(ad));
  }

  async findOne(id: number): Promise<PersonalServiceAdDto> {
    const ad = await this.adRepo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException(`Ad ${id} not found`);
    return this.toDto(ad);
  }

  async update(
    id: number,
    dto: UpdatePersonalServiceAdDto,
  ): Promise<PersonalServiceAdDto> {
    const preloaded = await this.adRepo.preload({ id, ...dto });
    if (!preloaded) throw new NotFoundException(`Ad ${id} not found`);
    const updated = await this.adRepo.save(preloaded);
    return this.toDto(updated);
  }

  async remove(id: number): Promise<{ action: 'deleted' | 'cancelled' }> {
    // Vérifier s'il y a des conversations liées à cette annonce
    const hasConversations = await this.conversationRepo.findOne({
      where: {
        adType: AdTypes.ServiceProvisions,
        adId: id
      }
    });

    if (hasConversations) {
      // S'il y a des conversations, mettre l'annonce au statut "cancelled"
      const ad = await this.adRepo.findOne({ where: { id } });
      if (!ad) {
        throw new NotFoundException(`Ad with id ${id} not found`);
      }
      
      ad.status = AdStatus.CANCELLED;
      await this.adRepo.save(ad);
      return { action: 'cancelled' };
    } else {
      // S'il n'y a pas de conversations, supprimer l'annonce
      const res = await this.adRepo.delete(id);
      if (res.affected === 0) {
        throw new NotFoundException(`Ad with id ${id} not found`);
      }
      return { action: 'deleted' };
    }
  }
}
