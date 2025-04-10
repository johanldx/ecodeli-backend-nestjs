import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingAdsService } from './shopping-ads.service';
import { ShoppingAdsController } from './shopping-ads.controller';
import { ShoppingAd } from './entities/shopping-ads.entity';
import { Location } from 'src/locations/entities/location.entity'; 
import { LocationsModule } from 'src/locations/locations.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingAd, Location]), 
    LocationsModule, 
  ],
  controllers: [ShoppingAdsController],
  providers: [ShoppingAdsService], 
})
export class ShoppingAdsModule {}
