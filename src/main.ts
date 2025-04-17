import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
 
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE, PATCH',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Ecodeli.fr API')
    .setDescription('Documentation de l’API de Ecodeli.fr')
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
