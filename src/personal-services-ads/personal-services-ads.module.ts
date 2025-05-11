import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalServiceAd } from './personal-service-ad.entity';
import { PersonalServicesAdsService } from './personal-services-ads.service';
import { PersonalServicesAdsController } from './personal-services-ads.controller';
import { UsersModule } from '../users/users.module';
import { PersonalServiceTypesModule } from '../personal-service-types/personal-service-types.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonalServiceAd]),
    UsersModule,
    PersonalServiceTypesModule,
    StorageModule,
  ],
  providers: [PersonalServicesAdsService],
  controllers: [PersonalServicesAdsController],
})
export class PersonalServicesAdsModule {}
