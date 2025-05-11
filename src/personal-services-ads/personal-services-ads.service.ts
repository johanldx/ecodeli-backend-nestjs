import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalServiceAd, AdStatus } from './personal-service-ad.entity';
import { CreatePersonalServiceAdDto } from './dto/create-personal-service-ad.dto';
import { UpdatePersonalServiceAdDto } from './dto/update-personal-service-ad.dto';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { PersonalServiceAdDto } from './dto/personal-service-ad.dto';

@Injectable()
export class PersonalServicesAdsService {
  constructor(
    @InjectRepository(PersonalServiceAd)
    private readonly adRepo: Repository<PersonalServiceAd>,
    private readonly storageService: StorageService,
  ) {}

  private toDto(ad: PersonalServiceAd): PersonalServiceAdDto {
    return {
      id: ad.id,
      postedById: ad.postedBy.id,
      title: ad.title,
      description: ad.description,
      imageUrls: ad.imageUrls,
      status: ad.status,
      typeId: ad.type.id,
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
    const reference = uuidv4();
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
      ...dto,
      postedBy: { id: userId } as any,
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

  async remove(id: number): Promise<void> {
    const res = await this.adRepo.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException(`Ad with id ${id} not found`);
    }
  }
}
