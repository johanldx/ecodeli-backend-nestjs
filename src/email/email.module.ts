import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Ajout du ConfigModule pour gérer .env
  providers: [EmailService],
  controllers: [],
  exports: [EmailService], // Assurez-vous que EmailService est exporté
})
export class EmailModule {} // Le module doit être bien défini
