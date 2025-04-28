import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseCartAd } from './entities/release-cart-ad.entity';
import { CreateReleaseCartAdDto } from './dto/create-release-cart-ad.dto';
import { UpdateReleaseCartAdDto } from './dto/update-release-cart-ad.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ReleaseCartAdsService {
  constructor(
    @InjectRepository(ReleaseCartAd)
    private readonly releaseCartAdRepo: Repository<ReleaseCartAd>,
  ) {}

  async create(
    dto: CreateReleaseCartAdDto,
    user: User,
  ): Promise<ReleaseCartAd> {
    const releaseCartAd = this.releaseCartAdRepo.create({
      ...dto,
      postedBy: user,
      departureLocation: { id: dto.departureLocation },
      arrivalLocation: { id: dto.arrivalLocation },
    });
    return this.releaseCartAdRepo.save(releaseCartAd);
  }

  async findAll(user: User, filters: any): Promise<ReleaseCartAd[]> {
    const qb = this.releaseCartAdRepo
      .createQueryBuilder('releaseCartAd')
      .leftJoinAndSelect('releaseCartAd.postedBy', 'postedBy')
      .leftJoinAndSelect('releaseCartAd.departureLocation', 'departureLocation')
      .leftJoinAndSelect('releaseCartAd.arrivalLocation', 'arrivalLocation');

    if (!user.administrator) {
      qb.where('releaseCartAd.status IN (:...allowed)', {
        allowed: ['pending', 'in_progress'],
      }).orWhere('releaseCartAd.postedBy.id = :userId', { userId: user.id });
    }

    return qb.getMany();
  }

  async findOne(id: number, user: User): Promise<ReleaseCartAd> {
    const releaseCartAd = await this.releaseCartAdRepo.findOne({
      where: { id },
      relations: ['postedBy', 'departureLocation', 'arrivalLocation'],
    });

    if (!releaseCartAd) throw new NotFoundException();

    if (!user.administrator && releaseCartAd.postedBy.id !== user.id) {
      throw new ForbiddenException();
    }

    return releaseCartAd;
  }

  async update(
    id: number,
    dto: UpdateReleaseCartAdDto,
    user: User,
  ): Promise<ReleaseCartAd> {
    const releaseCartAd = await this.findOne(id, user);

    if ('status' in dto) {
      throw new ForbiddenException('You cannot modify the status');
    }

    Object.assign(releaseCartAd, dto);
    return this.releaseCartAdRepo.save(releaseCartAd);
  }

  async remove(id: number, user: User): Promise<void> {
    const releaseCartAd = await this.findOne(id, user);

    await this.releaseCartAdRepo.delete(releaseCartAd.id);
  }
}
