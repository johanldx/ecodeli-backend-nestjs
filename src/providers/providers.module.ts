// src/providers/providers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './provider.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider]),
    StorageModule
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService]
})
export class ProvidersModule {}
