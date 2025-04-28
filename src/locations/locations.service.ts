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
    const location = this.locationRepository.create({
      ...createDto,
      user_id: user.id,
    });

    return this.locationRepository.save(location);
  }

  async findAll(user: any): Promise<Location[]> {
    if (user.administrator) {
      return this.locationRepository.find();
    } else {
      return this.locationRepository.find({
        where: [{ user_id: user.id }, { public: true }],
      });
    }
  }

  async findOne(id: number, user: any): Promise<Location> {
    const location = await this.locationRepository.findOneBy({ id });

    if (!location) throw new NotFoundException();

    assertUserOwnsResourceOrIsAdmin(user, location.user_id);

    return location;
  }

  async update(
    id: number,
    updateDto: UpdateLocationDto,
    user: any,
  ): Promise<Location> {
    const location = await this.findOne(id, user);
    Object.assign(location, updateDto);
    return this.locationRepository.save(location);
  }

  async remove(id: number, user: any): Promise<void> {
    const location = await this.findOne(id, user);
    await this.locationRepository.delete(location.id);
  }
}
