import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { I18nModule } from './i18n/i18n.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { APP_PIPE } from '@nestjs/core';
import { ClientsModule } from './clients/clients.module';
import { StorageModule } from './storage/storage.module';
import { DeliveryPersonsModule } from './delivery-persons/delivery-persons.module';
import { TradersModule } from './traders/traders.module';
import { ConfigurationsModule } from './configurations/configurations.module'; // ✅ ajouté
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '3306', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // ⚠️ À désactiver en production
      }),
    }),
    I18nModule,
    EmailModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    StorageModule,
    DeliveryPersonsModule,
    TradersModule,
    ConfigurationsModule,
    InvoicesModule, // ✅ ajouté ici dans les imports
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
