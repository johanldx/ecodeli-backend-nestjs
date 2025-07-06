import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  app.use(bodyParser.json());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept,Origin',
    credentials: false,
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
