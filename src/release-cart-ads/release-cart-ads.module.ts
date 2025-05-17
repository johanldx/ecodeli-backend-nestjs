import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleaseCartAdsController } from './release-cart-ads.controller';
import { ReleaseCartAdsService } from './release-cart-ads.service';
import { ReleaseCartAd } from './entities/release-cart-ad.entity';
import { UsersModule } from 'src/users/users.module';
import { Location } from 'src/locations/entities/location.entity';
import { StorageModule } from 'src/storage/storage.module';


@Module({
  imports: [TypeOrmModule.forFeature([ReleaseCartAd, Location]), UsersModule, StorageModule],
  controllers: [ReleaseCartAdsController],
  providers: [ReleaseCartAdsService],
})
export class ReleaseCartAdsModule {}
