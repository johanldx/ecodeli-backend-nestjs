import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { EmailModule } from '../email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from 'src/clients/clients.module';
import { DeliveryPersonsModule } from 'src/delivery-persons/delivery-persons.module';
import { TradersModule } from 'src/traders/traders.module';
import { ProvidersModule } from 'src/providers/providers.module';
import { WsJwtAuthGuard } from './guards/ws-jwt.guard';
import { Wallet } from 'src/wallets/entities/wallet.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Wallet]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    EmailModule,
    ClientsModule,
    DeliveryPersonsModule,
    TradersModule,
    ProvidersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WsJwtAuthGuard],
  exports: [JwtModule, AuthService, WsJwtAuthGuard],
})
export class AuthModule {}
