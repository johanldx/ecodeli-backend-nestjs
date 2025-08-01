import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { Location } from 'src/locations/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Route, Location])],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
