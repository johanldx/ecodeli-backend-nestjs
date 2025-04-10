import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingAd } from './entities/shopping-ads.entity';
import { CreateShoppingAdDto } from './dto/create-shopping-ad.dto';
import { UpdateShoppingAdDto } from './dto/update-shopping-ad.dto';
import { Location } from 'src/locations/entities/location.entity';

@Injectable()
export class ShoppingAdsService {
  constructor(
    @InjectRepository(ShoppingAd)
    private readonly shoppingAdRepository: Repository<ShoppingAd>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createShoppingAdDto: CreateShoppingAdDto): Promise<ShoppingAd> {
    const { departure_location, arrival_location } = createShoppingAdDto;

    const departureLocation = await this.locationRepository.findOne({ where: { id: departure_location } });
    const arrivalLocation = await this.locationRepository.findOne({ where: { id: arrival_location } });

    if (!departureLocation || !arrivalLocation) {
      throw new NotFoundException('Location(s) not found');
    }

    const shoppingAd = this.shoppingAdRepository.create({
      ...createShoppingAdDto,
      departureLocation: departureLocation,
      arrivalLocation: arrivalLocation,
    });

    return this.shoppingAdRepository.save(shoppingAd);
  }

  findAll(query: any): Promise<ShoppingAd[]> {
    return this.shoppingAdRepository.find(query);
  }

  async findOne(id: number): Promise<ShoppingAd> {
    const shoppingAd = await this.shoppingAdRepository.findOne({
      where: { id },
      relations: ['departure_location', 'arrival_location'], 
    });

    if (!shoppingAd) {
      throw new NotFoundException('Shopping Ad not found');
    }

    return shoppingAd;
  }

  async update(id: number, updateShoppingAdDto: UpdateShoppingAdDto): Promise<ShoppingAd> {
    const shoppingAd = await this.findOne(id); 


    Object.assign(shoppingAd, updateShoppingAdDto);

    return this.shoppingAdRepository.save(shoppingAd);
  }

  async remove(id: number): Promise<void> {
    const shoppingAd = await this.findOne(id);

    if (!shoppingAd) {
      throw new NotFoundException('Shopping Ad not found');
    }

    await this.shoppingAdRepository.delete(id);
  }
}
