import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from 'src/clients/clients.module';
import { DeliveryPersonsModule } from 'src/delivery-persons/delivery-persons.module';
import { TradersModule } from 'src/traders/traders.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    EmailModule,
    ClientsModule,
    DeliveryPersonsModule,
    TradersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
