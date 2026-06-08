import { ReflectionService } from '@grpc/reflection';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import path from 'path';
import { AppModule } from './app.module';
import appConfig, { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('Time Tracking Service')
    .setDescription('Timers, manual entries, and reporting.')
    .setVersion('1.0')
    .addTag('time-entries', 'for working with time entries.')
    .addTag('health', 'related to healthcheck')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs/openapi.json',
    yamlDocumentUrl: '/docs/openapi.yaml',
    customfavIcon: '/static/favicon.ico',
    customSiteTitle: 'Time Tracking API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
    },
  });

  const appConf = app.get<AppConfig>(appConfig.KEY);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'timeentries.v1',
        protoPath: [path.join(__dirname, './protos/time-entries.v1.proto')],
        url: `${appConf.host}:${appConf.grpcPort}`,
        onLoadPackageDefinition(pkg: any, server: any) {
          new ReflectionService(pkg).addToServer(server);
        },
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();
  await app.listen(appConf.httpPort, appConf.host);
}

bootstrap();
