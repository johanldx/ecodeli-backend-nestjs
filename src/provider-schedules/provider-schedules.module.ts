import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderSchedule } from './provider-schedule.entity';
import { ProviderSchedulesService } from './provider-schedules.service';
import { ProviderSchedulesController } from './provider-schedules.controller';
import { ProvidersModule } from '../providers/providers.module';
import { PersonalServiceTypesModule } from '../personal-service-types/personal-service-types.module';
import { Provider } from 'src/providers/provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProviderSchedule, Provider]),
    ProvidersModule,
    PersonalServiceTypesModule,
  ],
  providers: [ProviderSchedulesService],
  controllers: [ProviderSchedulesController],
})
export class ProviderSchedulesModule {}
