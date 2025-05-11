import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalServiceType } from './personal-service-type.entity';
import { PersonalServiceTypesService } from './personal-service-types.service';
import { PersonalServiceTypesController } from './personal-service-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalServiceType])],
  controllers: [PersonalServiceTypesController],
  providers: [PersonalServiceTypesService],
})
export class PersonalServiceTypesModule {}
