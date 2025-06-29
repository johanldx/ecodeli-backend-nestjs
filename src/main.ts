import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration spéciale pour Stripe webhook (DOIT être avant le parsing JSON global)
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  
  // Configuration générale pour le parsing JSON (après la configuration Stripe)
  app.use(bodyParser.json());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://192.168.0.179:3001',
      'https://ecodeli.fr',
    ],
    methods: 'GET,POST,PUT,DELETE, PATCH',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Ecodeli.fr API')
    .setDescription('Documentation de l\'API de Ecodeli.fr')
    .setVersion('BETA 0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  app.use('/documentation/open-api.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=ecodeli_open_api.json',
    );
    res.send(document);
  });

  await app.listen(3000);
}
bootstrap();
