import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAd } from './entities/delivery-ads.entity';
import { CreateDeliveryAdDto } from './dto/create-delivery-ads.dto';
import { UpdateDeliveryAdDto } from './dto/update-delivery-ads.dto';
import { StorageService } from 'src/storage/storage.service';
import { AdStatus } from './entities/delivery-ads.entity';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';
import { DeliveryStep } from 'src/delivery-steps/entities/delivery-step.entity';

@Injectable()
export class DeliveryAdsService {
  constructor(
    @InjectRepository(DeliveryAd)
    private readonly adRepo: Repository<DeliveryAd>,
    @InjectRepository(DeliveryStep)
    private readonly stepRepo: Repository<DeliveryStep>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: number,
    dto: CreateDeliveryAdDto,
    reference: string,
    images: Express.Multer.File[],
  ): Promise<DeliveryAd> {
    const urls = await Promise.all(
      images.map((f) =>
        this.storageService.uploadFile(
          f.buffer,
          f.originalname,
          'delivery-ads',
        ),
      ),
    );

    const ad = this.adRepo.create({
      ...dto,
      postedBy: { id: userId },
      reference,
      imageUrls: urls,
      status: AdStatus.PENDING,
    });
    return this.adRepo.save(ad);
  }

  async findAll(user: any, filters: any): Promise<DeliveryAd[]> {
    const qb = this.adRepo
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.postedBy', 'postedBy');

    if (!user.administrator) {
      qb.where('ad.status IN (:...allowed)', {
        allowed: [AdStatus.PENDING, AdStatus.IN_PROGRESS],
      }).orWhere('ad.postedBy.id = :userId', { userId: user.id });
    }

    if (filters.posted_by) {
      qb.andWhere('postedBy.id = :posted_by', { posted_by: filters.posted_by });
    }
    if (filters.delivery_date) {
      qb.andWhere('DATE(ad.delivery_date) = DATE(:d)', {
        d: filters.delivery_date,
      });
    }

    return qb.getMany();
  }

  async findOne(id: number, user: any): Promise<DeliveryAd> {
    const ad = await this.adRepo.findOne({
      where: { id },
      relations: ['postedBy', 'deliverySteps'],
    });
    if (!ad) throw new NotFoundException('Annonce introuvable');
    if (
      !user.administrator &&
      ad.postedBy.id !== user.id &&
      ad.status !== AdStatus.PENDING &&
      ad.status !== AdStatus.IN_PROGRESS
    ) {
      throw new ForbiddenException('Accès refusé');
    }
    return ad;
  }

  async update(
    id: number,
    user: any,
    dto: UpdateDeliveryAdDto,
    newImages?: Express.Multer.File[],
  ): Promise<DeliveryAd> {
    const ad = await this.adRepo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Annonce introuvable');
    assertUserOwnsResourceOrIsAdmin(user, ad.postedBy.id);

    if (newImages && newImages.length) {
      if (ad.imageUrls?.length) {
        await Promise.all(
          ad.imageUrls.map((u) => this.storageService.deleteFile(u)),
        );
      }
      const urls = await Promise.all(
        newImages.map((f) =>
          this.storageService.uploadFile(
            f.buffer,
            f.originalname,
            'delivery-ads',
          ),
        ),
      );
      ad.imageUrls = urls;
    }

    Object.assign(ad, dto);
    return this.adRepo.save(ad);
  }

  async remove(id: number, user: any): Promise<void> {
    const ad = await this.adRepo.findOne({
      where: { id },
      relations: ['postedBy'],
    });
    if (!ad) throw new NotFoundException('Annonce introuvable');

    assertUserOwnsResourceOrIsAdmin(user, ad.postedBy.id);

    if (ad.imageUrls?.length) {
      await Promise.all(
        ad.imageUrls.map((u) => this.storageService.deleteFile(u)),
      );
    }

    await this.adRepo.delete(id);
  }

  async updateStatus(
    id: number,
    status: AdStatus,
    userId: number,
  ): Promise<DeliveryAd> {
    const ad = await this.adRepo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Annonce introuvable');
    ad.status = status;
    return this.adRepo.save(ad);
  }

  async findByUser(userId: number) {
    return this.adRepo.find({ where: { postedBy: { id: userId } } });
  }
}
