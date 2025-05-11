import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalServiceTypeAuthorization } from './personal-service-type-authorization.entity';
import { PersonalServiceTypeAuthorizationsService } from './personal-service-type-authorizations.service';
import { PersonalServiceTypeAuthorizationsController } from './personal-service-type-authorizations.controller';
import { ProvidersModule } from '../providers/providers.module';
import { PersonalServiceTypesModule } from '../personal-service-types/personal-service-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonalServiceTypeAuthorization]),
    ProvidersModule,
    PersonalServiceTypesModule,
  ],
  controllers: [PersonalServiceTypeAuthorizationsController],
  providers: [PersonalServiceTypeAuthorizationsService],
})
export class PersonalServiceTypeAuthorizationsModule {}
