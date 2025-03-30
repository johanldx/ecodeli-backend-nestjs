import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryPersonsController } from './delivery-persons.controller';
import { DeliveryPersonsService } from './delivery-persons.service';
import { DeliveryPerson } from './delivery-person.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryPerson]), StorageModule],
  controllers: [DeliveryPersonsController],
  providers: [DeliveryPersonsService],
})
export class DeliveryPersonsModule {}
