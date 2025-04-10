import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleaseCartAdsController } from './release-cart-ads.controller';
import { ReleaseCartAdsService } from './release-cart-ads.service';
import { ReleaseCartAd } from './entities/release-cart-ad.entity';
import { UsersModule } from 'src/users/users.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([ReleaseCartAd]), UsersModule], 
  controllers: [ReleaseCartAdsController],
  providers: [ReleaseCartAdsService],
})
export class ReleaseCartAdsModule {}
