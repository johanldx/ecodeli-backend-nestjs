import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingAd } from './entities/shopping-ads.entity';
import { CreateShoppingAdDto } from './dto/create-shopping-ad.dto';
import { UpdateShoppingAdDto } from './dto/update-shopping-ad.dto';
import { Location } from 'src/locations/entities/location.entity';
import { StorageService } from 'src/storage/storage.service';
import { Express } from 'express';

@Injectable()
export class ShoppingAdsService {
  constructor(
    @InjectRepository(ShoppingAd)
    private readonly shoppingAdRepository: Repository<ShoppingAd>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: number,
    dto: CreateShoppingAdDto,
    images: Express.Multer.File[],
  ): Promise<ShoppingAd> {
    const { departureLocationId, arrivalLocationId } = dto;

    const departureLocation = await this.locationRepository.findOne({
      where: { id: departureLocationId },
    });
    const arrivalLocation = await this.locationRepository.findOne({
      where: { id: arrivalLocationId },
    });

    if (!departureLocation || !arrivalLocation) {
      throw new NotFoundException('Location(s) not found');
    }

    const imageUrls = await Promise.all(
      images.map((file) =>
        this.storageService.uploadFile(
          file.buffer,
          file.originalname,
          'shopping-ads',
        ),
      ),
    );

    const shoppingAd = this.shoppingAdRepository.create({
      ...dto,
      posted_by: userId,
      imageUrls,
      departureLocation,
      arrivalLocation,
    });

    return this.shoppingAdRepository.save(shoppingAd);
  }

  findAll(query: any): Promise<ShoppingAd[]> {
    return this.shoppingAdRepository.find(query);
  }

  async findOne(id: number): Promise<ShoppingAd> {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('ID invalide');
    }
    const shoppingAd = await this.shoppingAdRepository.findOne({
      where: { id },
    });

    if (!shoppingAd) {
      throw new NotFoundException('Shopping Ad not found');
    }

    return shoppingAd;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateShoppingAdDto,
    newImages?: Express.Multer.File[],
  ): Promise<ShoppingAd> {
    const ad = await this.findOne(id);

    if (ad.posted_by !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à modifier cette annonce');
    }

    if (dto.departureLocationId) {
      const departureLocation = await this.locationRepository.findOne({
        where: { id: dto.departureLocationId },
      });
      if (!departureLocation) {
        throw new NotFoundException('Departure location not found');
      }
      ad.departureLocation = departureLocation;
    }

    if (dto.arrivalLocationId) {
      const arrivalLocation = await this.locationRepository.findOne({
        where: { id: dto.arrivalLocationId },
      });
      if (!arrivalLocation) {
        throw new NotFoundException('Arrival location not found');
      }
      ad.arrivalLocation = arrivalLocation;
    }

    if (newImages?.length) {
      if (ad.imageUrls?.length) {
        await Promise.all(
          ad.imageUrls.map((url) => this.storageService.deleteFile(url)),
        );
      }

      const uploaded = await Promise.all(
        newImages.map((file) =>
          this.storageService.uploadFile(
            file.buffer,
            file.originalname,
            'shopping-ads',
          ),
        ),
      );

      ad.imageUrls = uploaded;
    }

    Object.assign(ad, dto);

    return this.shoppingAdRepository.save(ad);
  }

  async remove(id: number): Promise<void> {
    const ad = await this.findOne(id);

    if (ad.imageUrls?.length) {
      await Promise.all(
        ad.imageUrls.map((url) => this.storageService.deleteFile(url)),
      );
    }

    await this.shoppingAdRepository.delete(id);
  }

  async findByUser(userId: number) {
    return this.shoppingAdRepository.find({ where: { posted_by: userId } });
  }
}
