import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Location } from 'src/locations/entities/location.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const deliveryPerson = { id: createRouteDto.delivery_person_id };

    const departureLocation = await this.locationRepository.findOneBy({
      id: createRouteDto.departure_location,
    });
    if (!departureLocation) throw new Error('Lieu de départ invalide');

    const arrivalLocation = await this.locationRepository.findOneBy({
      id: createRouteDto.arrival_location,
    });
    if (!arrivalLocation) throw new Error('Lieu d’arrivée invalide');

    const route = this.routeRepository.create({
      deliveryPerson,
      departureLocationEntity: departureLocation,
      arrivalLocationEntity: arrivalLocation,
      day: createRouteDto.day,
    });

    return this.routeRepository.save(route);
  }

  findAll(): Promise<Route[]> {
    return this.routeRepository.find({
      relations: [
        'departureLocationEntity',
        'arrivalLocationEntity',
        'deliveryPerson',
      ],
    });
  }

  findOne(id: number): Promise<Route> {
    return this.routeRepository
      .findOne({
        where: { id },
        relations: [
          'departureLocationEntity',
          'arrivalLocationEntity',
          'deliveryPerson',
        ],
      })
      .then((route) => {
        if (!route) {
          throw new Error(`Route with id ${id} not found`);
        }
        return route;
      });
  }

  update(id: number, updateRouteDto: UpdateRouteDto): Promise<Route> {
    return this.routeRepository.save({ ...updateRouteDto, id });
  }

  remove(id: number): Promise<void> {
    return this.routeRepository.delete(id).then(() => {});
  }
}
