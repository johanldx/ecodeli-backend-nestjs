import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Co2CalculatorService } from './co2-calculator.service';
import { Co2CalculatorController } from './co2-calculator.controller';
import { Location } from '../locations/entities/location.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Location])],
  controllers: [Co2CalculatorController],
  providers: [Co2CalculatorService],
})
export class Co2CalculatorModule {} 