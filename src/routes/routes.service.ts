import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  create(createRouteDto: CreateRouteDto): Promise<Route> {
    const route = this.routeRepository.create(createRouteDto);
    return this.routeRepository.save(route);
  }

  findAll(): Promise<Route[]> {
    return this.routeRepository.find();
  }

  findOne(id: number): Promise<Route> {
    return this.routeRepository.findOne({ where: { id } }).then((route) => {
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
