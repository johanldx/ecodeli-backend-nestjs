import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { assertUserOwnsResourceOrIsAdmin } from 'src/auth/utils/assert-ownership';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createDto: CreateLocationDto, user: any): Promise<Location> {
    // TODO: sécuriser public/price uniquement accessible aux admins
    const location = this.locationRepository.create({
      ...createDto,
      userId: user.id,
    });

    return this.locationRepository.save(location);
  }

  async findAll(user: any): Promise<Location[]> {
    // TODO: filtrer intelligemment selon rôle (admin / owner / public)
    return this.locationRepository.find({
      where: { userId: user.id }, // temporaire : on ne renvoie que les siennes
    });
  }

  async findOne(id: number, user: any): Promise<Location> {
    const location = await this.locationRepository.findOneBy({ id });

    if (!location) throw new NotFoundException();

    assertUserOwnsResourceOrIsAdmin(user, location.userId);

    return location;
  }

  async update(
    id: number,
    updateDto: UpdateLocationDto,
    user: any,
  ): Promise<Location> {
    const location = await this.findOne(id, user); // inclut la vérification

    // TODO: empêcher modification public/price si non admin
    Object.assign(location, updateDto);
    return this.locationRepository.save(location);
  }

  async remove(id: number, user: any): Promise<void> {
    const location = await this.findOne(id, user); // inclut vérification
    await this.locationRepository.delete(location.id);
  }
}
